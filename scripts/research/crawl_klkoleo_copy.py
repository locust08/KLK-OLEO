#!/usr/bin/env python3
"""Build a source-attributed KLK OLEO copy deck from public website data."""

from __future__ import annotations

import asyncio
import html
import json
import re
import sys
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import httpx
from bs4 import BeautifulSoup
from crawl4ai import AsyncWebCrawler, BrowserConfig, CacheMode, CrawlerRunConfig

BASE = "https://www.klkoleo.com"
ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs" / "klkoleo-copywriting-content.md"
CMS_OUTPUT = ROOT / "docs" / "klkoleo-cms-content.md"
RAW_OUTPUT = ROOT / "docs" / "klkoleo-crawl-inventory.json"
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
CMS_COLLECTIONS = ("career", "media")
EXCLUDED_SITEMAPS = {"product-sitemap.xml", "product_cat-sitemap.xml"}
EXCLUDED_MARKET_PATHS = ("/markets", "/lifescience", "/oleo-basics")
MAIN_PRODUCT_PAGES = (
    ("Amides", "/products/amides/"),
    ("Anionic Surfactants", "/products/anionic-surfactants/"),
    ("Esters", "/products/esters/"),
    ("Fatty Acids", "/products/fatty-acids/"),
    ("Fatty Alcohols", "/products/fatty-alcohols/"),
    ("Glycerine", "/products/glycerine/"),
    ("Nonionic Surfactants", "/products/nonionic-surfactants/"),
    ("Phytonutrients", "/products/phytonutrients/"),
)
OUTPUT_SECTION_TITLES = (
    "Crawl scope and handoff notes",
    "Recommended CMS collection fields",
    "Additional CMS candidates",
    "Banner copy and homepage messaging (CMS)",
    "Products (main Products tab)",
    "News & Events (CMS)",
    "Careers (CMS)",
    "General website copy",
    "Media asset inventory",
    "Crawl failures and migration checks",
)


def clean_html(value: str | None) -> str:
    if not value:
        return ""
    soup = BeautifulSoup(value, "lxml")
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()
    lines: list[str] = []
    for line in soup.get_text("\n").splitlines():
        line = re.sub(r"\s+", " ", html.unescape(line)).strip()
        if line and (not lines or line != lines[-1]):
            lines.append(line)
    return "\n\n".join(lines)


def md_escape(value: Any) -> str:
    return str(value or "").replace("|", "\\|").replace("\n", " ").strip()


def is_english_public_url(url: str) -> bool:
    parsed = urlparse(url)
    return parsed.netloc in {"klkoleo.com", "www.klkoleo.com"} and not parsed.path.startswith(("/de/", "/cn/"))


def is_in_scope_url(url: str) -> bool:
    return is_english_public_url(url) and not urlparse(url).path.startswith(EXCLUDED_MARKET_PATHS)


async def get_with_retries(client: httpx.AsyncClient, url: str, attempts: int = 4) -> httpx.Response:
    last_error: Exception | None = None
    for attempt in range(attempts):
        try:
            response = await client.get(url)
            response.raise_for_status()
            return response
        except Exception as exc:
            last_error = exc
            await asyncio.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f"Failed after {attempts} attempts: {url}: {last_error}")


async def fetch_sitemaps(client: httpx.AsyncClient) -> tuple[dict[str, list[str]], list[str]]:
    index = await get_with_retries(client, f"{BASE}/sitemap_index.xml")
    root = ET.fromstring(index.content)
    sitemap_urls = [node.text for node in root.findall("sm:sitemap/sm:loc", NS) if node.text]
    semaphore = asyncio.Semaphore(5)

    async def fetch_one(url: str) -> tuple[str, list[str]]:
        async with semaphore:
            response = await get_with_retries(client, url)
        sitemap_root = ET.fromstring(response.content)
        urls = [node.text for node in sitemap_root.findall("sm:url/sm:loc", NS) if node.text]
        return url.rsplit("/", 1)[-1], urls

    fetched = await asyncio.gather(*(fetch_one(url) for url in sitemap_urls))
    by_sitemap = {
        name: [url for url in urls if is_in_scope_url(url)]
        for name, urls in fetched
        if name not in EXCLUDED_SITEMAPS
    }
    all_urls = sorted({url for urls in by_sitemap.values() for url in urls})
    return by_sitemap, all_urls


async def fetch_wp_collection(client: httpx.AsyncClient, rest_base: str) -> list[dict[str, Any]]:
    fields = {
        "career": "id,date,modified,slug,link,title,excerpt,content,featured_media,career-country,career-work-location,yoast_head_json",
        "media": "id,date,modified,slug,link,title,caption,description,alt_text,media_type,mime_type,source_url,media_details",
    }[rest_base]
    prefix = f"{BASE}/wp-json/wp/v2/{rest_base}?per_page=100&_fields={fields}"
    first = await get_with_retries(client, f"{prefix}&page=1")
    items = list(first.json())
    total_pages = int(first.headers.get("X-WP-TotalPages", "1"))
    semaphore = asyncio.Semaphore(5)

    async def fetch_page(page: int) -> list[dict[str, Any]]:
        async with semaphore:
            response = await get_with_retries(client, f"{prefix}&page={page}")
        return response.json()

    for page_items in await asyncio.gather(*(fetch_page(page) for page in range(2, total_pages + 1))):
        items.extend(page_items)
    return items


def result_markdown(result: Any) -> str:
    value = getattr(result, "markdown", "") or ""
    if isinstance(value, str):
        return sanitize_markdown(value)
    for attr in ("fit_markdown", "raw_markdown", "markdown_with_citations"):
        candidate = getattr(value, attr, "")
        if candidate:
            return sanitize_markdown(str(candidate))
    return sanitize_markdown(str(value))


def sanitize_markdown(value: str) -> str:
    """Remove site-wide UI chrome while preserving the page's authored content."""
    text = value.strip()
    consent_starts = [position for marker in ("![Revisit consent button]", "Customise Consent Preferences") if (position := text.find(marker)) >= 0]
    consent_start = min(consent_starts) if consent_starts else -1
    consent_end_marker = "Powered by [![](https://cdn-cookieyes.com/assets/images/poweredbtcky.svg)]"
    if consent_start >= 0:
        consent_end = text.find(consent_end_marker, consent_start)
        if consent_end >= 0:
            consent_end = text.find("\n", consent_end)
            text = text[:consent_start] + text[consent_end + 1 :]
    search_marker = "\n### Search\n"
    search_end = text.find(search_marker)
    if search_end >= 0:
        text = text[search_end + len(search_marker) :]
    footer_starts = [
        position
        for marker in ("\n### About\n  * [KLK OLEO in Brief]", "\n  * [About Us▼]")
        if (position := text.find(marker)) >= 0
    ]
    if footer_starts:
        text = text[: min(footer_starts)]
    text = re.sub(r"^.*data:image/svg\+xml.*$", "", text, flags=re.MULTILINE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalize_media(item: Any) -> dict[str, str] | None:
    if isinstance(item, str):
        return {"src": item, "alt": "", "title": "", "description": "", "type": ""}
    if not isinstance(item, dict):
        return None
    src = item.get("src") or item.get("url") or item.get("href")
    if not src:
        return None
    src = str(src).strip()
    if src.startswith("data:") or "cdn-cookieyes.com" in src:
        return None
    if ", " in src and "http" in src:
        src = src.split(", ", 1)[0].split(" ", 1)[0]
    return {
        "src": src,
        "alt": str(item.get("alt") or "").strip(),
        "title": str(item.get("title") or "").strip(),
        "description": str(item.get("desc") or item.get("description") or "").strip(),
        "type": str(item.get("type") or "").strip(),
    }


async def crawl_pages(urls: list[str]) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    browser = BrowserConfig(
        headless=True, verbose=False, viewport_width=1440, viewport_height=1000,
        enable_stealth=True, memory_saving_mode=True, max_pages_before_recycle=80,
    )
    config = CrawlerRunConfig(
        cache_mode=CacheMode.BYPASS, wait_until="domcontentloaded", page_timeout=45000,
        remove_overlay_elements=True, remove_consent_popups=True, remove_forms=True,
        excluded_tags=["script", "style", "noscript", "svg", "nav", "footer"],
        word_count_threshold=1, image_score_threshold=0, scan_full_page=True,
        scroll_delay=0.05, max_scroll_steps=12, semaphore_count=7, stream=True,
        max_retries=2, verbose=False,
    )
    pages: list[dict[str, Any]] = []
    media_by_src: dict[str, dict[str, str]] = {}
    async with AsyncWebCrawler(config=browser) as crawler:
        stream = await crawler.arun_many(urls=urls, config=config)
        async for result in stream:
            record = {
                "url": getattr(result, "url", ""),
                "success": bool(getattr(result, "success", False)),
                "status_code": getattr(result, "status_code", None),
                "error": getattr(result, "error_message", "") or "",
                "markdown": result_markdown(result),
                "metadata": getattr(result, "metadata", {}) or {},
                "media": [],
            }
            media = getattr(result, "media", {}) or {}
            groups = media.values() if isinstance(media, dict) else [media]
            for group in groups:
                if not isinstance(group, list):
                    continue
                for raw_item in group:
                    item = normalize_media(raw_item)
                    if item:
                        media_by_src.setdefault(item["src"], item)
                        record["media"].append(item["src"])
            record["media"] = sorted(set(record["media"]))
            pages.append(record)
            print(f"[{len(pages)}/{len(urls)}] {'ok' if record['success'] else 'failed'}: {record['url']}", flush=True)
    return pages, sorted(media_by_src.values(), key=lambda item: item["src"])


def section_for_sitemap(name: str) -> str:
    return {
        "post-sitemap.xml": "Articles / Posts",
        "page-sitemap.xml": "General Pages",
        "r3d-sitemap.xml": "R&D Content",
        "timeline_slider_post-sitemap.xml": "Timeline / Milestones",
        "report-sitemap.xml": "Reports",
        "news-media-sitemap.xml": "News & Events (CMS)",
        "brand-sitemap.xml": "Brands",
        "hub-sitemap.xml": "Content Hubs",
        "category-sitemap.xml": "Article Archives",
        "product_cat-sitemap.xml": "Market Archives",
        "r3d_category-sitemap.xml": "R&D Archives",
        "wpostahs-slider-category-sitemap.xml": "Timeline Archives",
        "archive-by-year-sitemap.xml": "News Year Archives",
        "products-sitemap.xml": "Product Family Archives",
        "news-category-sitemap.xml": "News Category Archives",
        "author-sitemap.xml": "Author Archives",
        "product-sitemap.xml": "Rendered Products",
    }.get(name, name)


def add_cms_entry(lines: list[str], item: dict[str, Any], index: int, kind: str, rendered: str = "") -> None:
    title = clean_html(item.get("title", {}).get("rendered")) or f"Untitled {kind} {item.get('id', '')}"
    excerpt = clean_html(item.get("excerpt", {}).get("rendered"))
    body = clean_html(item.get("content", {}).get("rendered"))
    lines.extend([
        f"### {index}. {title}", "", f"- **Source:** {item.get('link', '')}",
        f"- **Slug:** `{item.get('slug', '')}`", f"- **Published:** {item.get('date', '')}",
        f"- **Modified:** {item.get('modified', '')}", f"- **Featured media ID:** {item.get('featured_media') or '—'}",
    ])
    if kind == "product":
        seo = item.get("yoast_head_json") or {}
        lines.extend([
            f"- **Product family term IDs:** {', '.join(map(str, item.get('products', []) or [])) or '—'}",
            f"- **Market/category term IDs:** {', '.join(map(str, item.get('product_cat', []) or [])) or '—'}",
            f"- **Brand term IDs:** {', '.join(map(str, item.get('product_brand', []) or [])) or '—'}",
            f"- **SEO title:** {seo.get('title', '')}", f"- **SEO description:** {seo.get('description', '')}",
        ])
    else:
        lines.extend([
            f"- **Country term IDs:** {', '.join(map(str, item.get('career-country', []) or [])) or '—'}",
            f"- **Work location term IDs:** {', '.join(map(str, item.get('career-work-location', []) or [])) or '—'}",
        ])
    lines.extend(["", "**Summary**", "", excerpt or "_No separate summary in CMS._", "", "**Body copy**", "", body or "_No body copy in CMS._", ""])
    if rendered:
        lines.extend(["**Rendered page copy**", "", rendered, ""])


def top_level_section(markdown: str, title: str) -> str:
    marker = f"## {title}\n"
    start = markdown.find(marker)
    if start < 0:
        return ""
    later_starts = [
        position
        for other_title in OUTPUT_SECTION_TITLES
        if other_title != title
        and (position := markdown.find(f"\n## {other_title}\n", start + len(marker))) >= 0
    ]
    end = min(later_starts) if later_starts else len(markdown)
    return markdown[start:end].rstrip()


def write_copy_deck(by_sitemap: dict[str, list[str]], all_urls: list[str], pages: list[dict[str, Any]], cms: dict[str, list[dict[str, Any]]], crawl_media: list[dict[str, str]]) -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    captured_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    page_by_url = {page["url"].rstrip("/"): page for page in pages}
    successes = [page for page in pages if page["success"]]
    failures = [page for page in pages if not page["success"]]
    url_to_sitemaps: dict[str, list[str]] = defaultdict(list)
    for sitemap, urls in by_sitemap.items():
        for url in urls:
            if is_in_scope_url(url):
                url_to_sitemaps[url.rstrip("/")].append(sitemap)
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for page in successes:
        sitemap = url_to_sitemaps.get(page["url"].rstrip("/"), ["Discovered page"])[0]
        grouped[section_for_sitemap(sitemap)].append(page)

    lines = [
        "# KLK OLEO Website Copywriting Content Inventory", "",
        "> Source-preserving content deck for the website redesign. Copy below is extracted from the public KLK OLEO website and public WordPress CMS endpoints; it is not newly authored marketing copy.", "",
        "## Crawl scope and handoff notes", "", f"- **Source:** {BASE}/", f"- **Captured (UTC):** {captured_at}",
        "- **Languages:** Default-site URLs are included; explicit `/de/` and `/cn/` mirrors are excluded. Some default-site timeline/archive records retain German or Chinese labels from the source CMS.",
        f"- **Sitemap URLs inventoried:** {len(all_urls):,}", f"- **Rendered pages attempted with Crawl4AI:** {len(pages):,}",
        f"- **Rendered pages captured:** {len(successes):,}", f"- **Rendered page failures:** {len(failures):,}",
        f"- **Main Products-tab families included:** {len(MAIN_PRODUCT_PAGES):,}", f"- **CMS careers captured:** {len(cms.get('career', [])):,}",
        f"- **WordPress media records captured:** {len(cms.get('media', [])):,}", f"- **Additional media found in rendered pages:** {len(crawl_media):,}",
        "- **Media treatment:** source URLs, alt text, captions, and metadata are preserved; media binaries are not copied locally.",
        "- **CMS model for the revamp:** Banners, Products, News & Events, and Careers should be migrated as structured collections.",
        f"- **Product scope:** only the {len(MAIN_PRODUCT_PAGES)} product families under the main Products navigation are included. Market pages, Life Science/Oleo Basics market landings, the market-catalogue product sitemap, and market SKU CMS records are excluded from both this deck and the raw inventory.",
        "- **Career-source caveat:** the public careers CMS endpoint currently contains no published job records; the active careers landing-page copy is included below as CMS migration seed content.", "",
        "## Recommended CMS collection fields", "", "### Banners", "",
        "`title`, `eyebrow`, `headline`, `body`, `cta_label`, `cta_url`, `desktop_media`, `mobile_media`, `alt_text`, `display_order`, `publish_start`, `publish_end`, `status`", "",
        "### Products", "", "`name`, `slug`, `summary`, `body`, `product_family`, `market`, `brand`, `featured_media`, `gallery`, `technical_documents`, `seo_title`, `seo_description`, `status`, `source_url`", "",
        "### News & Events", "", "`title`, `slug`, `type`, `event_date`, `publish_date`, `summary`, `body`, `featured_media`, `gallery`, `location`, `cta_label`, `cta_url`, `seo_title`, `seo_description`, `status`, `source_url`", "",
        "### Careers", "", "`job_title`, `slug`, `country`, `work_location`, `employment_type`, `summary`, `responsibilities`, `requirements`, `application_url`, `publish_date`, `closing_date`, `status`, `source_url`", "",
        "## Additional CMS candidates", "",
        "The following materials have repeatable structures, multiple records, or recurring maintenance needs that make them better suited to structured CMS collections than ordinary pages.", "",
        "| Priority | Candidate | Crawl evidence | Recommendation |", "|---|---|---:|---|",
        f"| High | Resources & Documents | {len(set(by_sitemap.get('r3d-sitemap.xml', []))):,} records | Create a searchable resource library for brochures, policies, technical documents, sustainability materials, and downloadable files. |",
        f"| High | History & Milestones | {len(set(by_sitemap.get('timeline_slider_post-sitemap.xml', []))):,} timeline records | Model milestones as ordered, localizable records instead of maintaining timeline slides manually. |",
        f"| High | Brands | {len(set(by_sitemap.get('brand-sitemap.xml', []))):,} unique brand pages | Store brand identity, summary, product-family relationships, imagery, and downloads once for reuse throughout the site. |",
        "| High | Global Locations & Facilities | 13 identified location/facility pages | Use structured locations for regional listings, maps, contacts, capabilities, certifications, and enquiry routing. |",
        f"| Medium | Reports & Publications | {len(set(by_sitemap.get('report-sitemap.xml', []))):,} report records | Manage reports by year and type with downloadable files, thumbnails, and archive controls. |",
        f"| Medium | Knowledge Hubs / Editorial Series | {len(set(by_sitemap.get('hub-sitemap.xml', []))):,} hub records | Use an article-like collection when these educational pages will continue to grow or require cross-linking. |",
        "| Medium | Accreditations & Certifications | Repeated accreditation material on a dedicated page | Use structured records if certificates, facilities, validity dates, and downloadable evidence require ongoing maintenance. |",
        f"| Merge into existing | Exhibition & Conference Pages | {len(set(by_sitemap.get('post-sitemap.xml', []))):,} event-oriented posts | Import these into the existing News & Events collection with `type = event`; do not create a separate overlapping collection. |",
        "", "### Suggested fields for additional collections", "",
        "- **Resources & Documents:** `title`, `slug`, `resource_type`, `category`, `language`, `summary`, `file`, `thumbnail`, `version`, `published_at`, `related_content`, `status`.",
        "- **History & Milestones:** `year`, `date`, `title`, `body`, `image`, `locale`, `display_order`, `status`.",
        "- **Brands:** `name`, `slug`, `summary`, `body`, `logo`, `hero_media`, `product_families`, `downloads`, `external_url`, `status`.",
        "- **Global Locations & Facilities:** `name`, `slug`, `facility_type`, `country`, `region`, `address`, `coordinates`, `phone`, `email`, `capabilities`, `certifications`, `enquiry_route`, `status`.",
        "- **Reports & Publications:** `title`, `year`, `report_type`, `summary`, `file`, `thumbnail`, `published_at`, `status`.",
        "- **Knowledge Hubs:** `title`, `slug`, `summary`, `body`, `featured_media`, `author`, `topics`, `related_products`, `published_at`, `status`.",
        "- **Accreditations & Certifications:** `name`, `issuer`, `certificate_number`, `facility`, `scope`, `valid_from`, `valid_until`, `logo`, `certificate_file`, `status`.",
        "", "### Materials that should remain pages or system configuration", "",
        "- Corporate overview, sustainability overview, supply-chain overview, disclaimer, and contact pages are primarily one-off editorial pages.",
        "- Enquiry forms, checkout, cart, account, thank-you, and staging/test pages should remain form, commerce, or system configuration—not editorial CMS collections.",
        "- Category, author, and yearly archive URLs should be generated automatically from collection metadata rather than entered as CMS records.", "",
        "## Banner copy and homepage messaging (CMS)", "",
    ]
    home = page_by_url.get(BASE)
    if home:
        lines.extend([home["markdown"] or "_No extractable homepage copy returned._", "", "### Homepage / banner media", ""])
        lines.extend(f"- {url}" for url in home.get("media", []))
        lines.append("")
        for group_pages in grouped.values():
            group_pages[:] = [page for page in group_pages if page["url"].rstrip("/") != BASE]
    else:
        lines.extend(["_Homepage crawl was not returned successfully; see crawl failures._", ""])

    lines.extend(["## Products (main Products tab)", ""])
    main_product_urls = {f"{BASE}{path}".rstrip("/") for _, path in MAIN_PRODUCT_PAGES}
    for group_pages in grouped.values():
        group_pages[:] = [page for page in group_pages if page["url"].rstrip("/") not in main_product_urls]
    for index, (label, path) in enumerate(MAIN_PRODUCT_PAGES, 1):
        url = f"{BASE}{path}"
        page = page_by_url.get(url.rstrip("/"))
        lines.extend([f"### {index}. {label}", "", f"- **Source:** {url}", ""])
        if page and page.get("success"):
            lines.extend([page.get("markdown") or "_No extractable copy._", ""])
        else:
            lines.extend(["_This Products-tab page was not captured successfully._", ""])

    ignored_market_catalogue_urls = {
        page["url"].rstrip("/")
        for page in successes
        if re.fullmatch(r"/markets(?:/page/\d+)?/?", urlparse(page["url"]).path)
    }
    grouped.pop("Rendered Products", None)
    for group_pages in grouped.values():
        group_pages[:] = [page for page in group_pages if page["url"].rstrip("/") not in ignored_market_catalogue_urls]

    lines.extend(["## News & Events (CMS)", ""])
    for index, page in enumerate(sorted(grouped.pop("News & Events (CMS)", []), key=lambda item: item["url"]), 1):
        title = clean_html(str(page.get("metadata", {}).get("title") or page["url"].rstrip("/").rsplit("/", 1)[-1]))
        lines.extend([f"### {index}. {title}", "", f"- **Source:** {page['url']}", "", page["markdown"] or "_No extractable copy._", ""])

    lines.extend(["## Careers (CMS)", ""])
    careers = sorted(cms.get("career", []), key=lambda item: clean_html(item.get("title", {}).get("rendered", "")).casefold())
    for index, item in enumerate(careers, 1):
        add_cms_entry(lines, item, index, "career")
    career_landing = page_by_url.get(f"{BASE}/careers")
    if career_landing and career_landing.get("success"):
        lines.extend([
            "### Careers landing-page copy",
            "",
            f"- **Source:** {BASE}/careers/",
            "",
            career_landing.get("markdown") or "_No extractable copy._",
            "",
        ])
        for group_pages in grouped.values():
            group_pages[:] = [page for page in group_pages if page["url"].rstrip("/") != f"{BASE}/careers"]

    lines.extend(["## General website copy", ""])
    order = ["General Pages", "Articles / Posts", "R&D Content", "Reports", "Brands", "Content Hubs", "Timeline / Milestones", "Article Archives", "Market Archives", "R&D Archives", "Timeline Archives", "News Year Archives", "Product Family Archives", "News Category Archives", "Author Archives", "Discovered page"]
    for name in order + sorted(set(grouped) - set(order)):
        if not grouped.get(name):
            continue
        lines.extend([f"### {name}", ""])
        for page in sorted(grouped[name], key=lambda item: item["url"]):
            title = clean_html(str(page.get("metadata", {}).get("title") or page["url"].rstrip("/").rsplit("/", 1)[-1]))
            lines.extend([f"#### {title}", "", f"- **Source:** {page['url']}", "", page["markdown"] or "_No extractable copy._", ""])

    lines.extend(["## Media asset inventory", "", "### WordPress media library", "", "| ID | Type | Title / alt text | Source URL |", "|---:|---|---|---|"])
    for item in sorted(cms.get("media", []), key=lambda value: int(value.get("id", 0))):
        title = clean_html(item.get("title", {}).get("rendered"))
        alt = item.get("alt_text") or ""
        label = title if not alt or alt == title else f"{title} / Alt: {alt}"
        lines.append(f"| {item.get('id', '')} | {md_escape(item.get('mime_type') or item.get('media_type'))} | {md_escape(label)} | {item.get('source_url', '')} |")
    lines.extend(["", "### Additional assets found by Crawl4AI", "", "| Type | Alt / title / description | Source URL |", "|---|---|---|"])
    for item in crawl_media:
        label = " / ".join(filter(None, [item.get("alt"), item.get("title"), item.get("description")]))
        lines.append(f"| {md_escape(item.get('type'))} | {md_escape(label)} | {item.get('src', '')} |")

    lines.extend(["", "## Crawl failures and migration checks", ""])
    if failures:
        lines.extend(["| URL | Status | Error |", "|---|---:|---|"])
        for page in sorted(failures, key=lambda item: item["url"]):
            lines.append(f"| {page['url']} | {page.get('status_code') or ''} | {md_escape(page.get('error'))} |")
    else:
        lines.append("No Crawl4AI page failures were recorded.")
    lines.extend(["", "### Manual checks before launch", "",
        "- Confirm which homepage slides are current; WordPress/Elementor may retain inactive banner media in the library.",
        "- Resolve CMS taxonomy IDs to approved display labels during migration.",
        "- Confirm expired vacancies before importing careers.",
        "- Confirm whether historical news, reports, and timeline entries should remain published or move to an archive state.",
        "- Run an accessibility pass on every retained image and replace blank or filename-like alt text.",
        "- Validate document links and obtain replacement files for any protected, missing, or redirected asset.", ""])
    combined = "\n".join(lines)
    scope = top_level_section(combined, "Crawl scope and handoff notes")
    general = top_level_section(combined, "General website copy")
    failures_section = top_level_section(combined, "Crawl failures and migration checks")
    copywriting = "\n\n".join(filter(None, [
        "# KLK OLEO Website Copywriting Content",
        "> Static and general page copy for the website redesign. CMS-managed banners, products, news/events, careers, and the media inventory are maintained separately.",
        f"- **Source:** {BASE}/\n- **Captured (UTC):** {captured_at}",
        general,
        failures_section,
    ])) + "\n"
    cms_section_titles = (
        "Recommended CMS collection fields",
        "Additional CMS candidates",
        "Banner copy and homepage messaging (CMS)",
        "Products (main Products tab)",
        "News & Events (CMS)",
        "Careers (CMS)",
        "Media asset inventory",
    )
    cms_sections = [top_level_section(combined, title) for title in cms_section_titles]
    cms_content = "\n\n".join(filter(None, [
        "# KLK OLEO CMS Content Inventory",
        "> Structured content and supporting media intended for CMS migration in the revamped website.",
        scope,
        *cms_sections,
    ])) + "\n"
    OUTPUT.write_text(copywriting, encoding="utf-8")
    CMS_OUTPUT.write_text(cms_content, encoding="utf-8")
    RAW_OUTPUT.write_text(json.dumps({"captured_at": captured_at, "sitemaps": by_sitemap, "all_english_urls": all_urls, "rendered_pages": pages, "cms": cms, "crawl_media": crawl_media}, ensure_ascii=False, indent=2), encoding="utf-8")


async def main() -> int:
    if "--prune-markets" in sys.argv:
        raw = json.loads(RAW_OUTPUT.read_text(encoding="utf-8"))
        by_sitemap = {
            name: [url for url in urls if is_in_scope_url(url)]
            for name, urls in raw["sitemaps"].items()
            if name not in EXCLUDED_SITEMAPS
        }
        all_urls = sorted({url for urls in by_sitemap.values() for url in urls})
        pages = [page for page in raw["rendered_pages"] if is_in_scope_url(page.get("url", ""))]
        for page in pages:
            page["markdown"] = sanitize_markdown(page.get("markdown", ""))
        referenced_media = {src for page in pages for src in page.get("media", [])}
        crawl_media = [item for item in raw["crawl_media"] if item.get("src") in referenced_media]
        cms = {key: value for key, value in raw["cms"].items() if key != "product"}
        write_copy_deck(by_sitemap, all_urls, pages, cms, crawl_media)
        print(f"Wrote {OUTPUT}", flush=True)
        print(f"Wrote {CMS_OUTPUT}", flush=True)
        print(f"Wrote {RAW_OUTPUT}", flush=True)
        return 0

    timeout = httpx.Timeout(75.0, connect=30.0)
    limits = httpx.Limits(max_connections=8, max_keepalive_connections=5)
    headers = {"User-Agent": "Mozilla/5.0 (compatible; KLK-OLEO-content-audit/1.0)"}
    async with httpx.AsyncClient(headers=headers, timeout=timeout, limits=limits, follow_redirects=True) as client:
        by_sitemap, all_urls = await fetch_sitemaps(client)
        results = await asyncio.gather(*(fetch_wp_collection(client, name) for name in CMS_COLLECTIONS))
    cms = dict(zip(CMS_COLLECTIONS, results))
    crawl_urls = list(all_urls)
    if BASE not in {url.rstrip("/") for url in crawl_urls}:
        crawl_urls.insert(0, f"{BASE}/")
    print(f"Sitemap URLs: {len(all_urls)}", flush=True)
    print(f"CMS careers: {len(cms['career'])}", flush=True)
    print(f"CMS media: {len(cms['media'])}", flush=True)
    print(f"Crawl4AI rendered URLs: {len(crawl_urls)}", flush=True)
    pages, crawl_media = await crawl_pages(crawl_urls)
    write_copy_deck(by_sitemap, all_urls, pages, cms, crawl_media)
    print(f"Wrote {OUTPUT}", flush=True)
    print(f"Wrote {CMS_OUTPUT}", flush=True)
    print(f"Wrote {RAW_OUTPUT}", flush=True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(asyncio.run(main()))
    except KeyboardInterrupt:
        sys.exit(130)

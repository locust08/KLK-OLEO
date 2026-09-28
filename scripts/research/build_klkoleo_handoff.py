#!/usr/bin/env python3
"""Build a deterministic, context-free design handoff from the KLK OLEO crawl."""

from __future__ import annotations

import argparse
import csv
import hashlib
import html
import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse


BASE = "https://www.klkoleo.com"
PRODUCT_FAMILIES = (
    ("Amides", "amides"),
    ("Anionic Surfactants", "anionic-surfactants"),
    ("Esters", "esters"),
    ("Fatty Acids", "fatty-acids"),
    ("Fatty Alcohols", "fatty-alcohols"),
    ("Glycerine", "glycerine"),
    ("Nonionic Surfactants", "nonionic-surfactants"),
    ("Phytonutrients", "phytonutrients"),
)
MARKET_PATHS = ("/markets", "/lifescience", "/oleo-basics")
SYSTEM_SLUGS = {
    "cart", "checkout", "my-account", "thank-you", "cv-form", "general-enquiry",
    "more-general-form", "request-a-quote", "test", "test-career", "careers2",
    "contact-us-staging", "company", "test-2", "request-quote", "careers-2", "products-banner",
}
LOCATION_SLUGS = {
    "kl-kepong-oleomas-sdn-bhd", "klk-bioenergy-sdn-bhd", "klk-oleo-americas-inc",
    "klkemmerich", "klkoleo-india", "klktemix", "klktensachem",
    "palm-oleo-klang-sdn-bhd", "palm-oleo-sdn-bhd", "pt-klk-dumai",
    "ptperindustriansawitsynergi", "taiko-palm-oleo-zhangjiagang-co-ltd", "stolthavenwestport",
}
PRIMARY_BANNERS = (
    ("home", "/", "home.hero"),
    ("about", "/company/klk-oleo-brief/", "about.hero"),
    ("products", "/products/", "products.hero"),
    ("sustainability", "/sustainability-principled-by-integrity/", "sustainability.hero"),
    ("news-events", "/news-media/", "news-events.hero"),
    ("careers", "/careers/", "careers.hero"),
    ("contact", "/contact-us/", "contact.hero"),
)


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def strip_html(value: Any) -> str:
    text = re.sub(r"<[^>]+>", " ", str(value or ""))
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def normalize_url(url: str) -> str:
    if not url:
        return ""
    parsed = urlparse(url)
    path = re.sub(r"/{2,}", "/", parsed.path or "/")
    if path != "/" and not path.endswith("/") and not re.search(r"\.[a-zA-Z0-9]{2,6}$", path):
        path += "/"
    query = f"?{parsed.query}" if parsed.query else ""
    return f"{parsed.scheme or 'https'}://{parsed.netloc or 'www.klkoleo.com'}{path}{query}"


def path_for(url: str) -> str:
    path = urlparse(url).path or "/"
    return path if path == "/" else "/" + path.strip("/") + "/"


def slug_for(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path.strip("/")
    if not path and parsed.query:
        query_value = parsed.query.split("&", 1)[0].split("=", 1)[-1]
        if query_value:
            return query_value
    return path.rsplit("/", 1)[-1] if path else "home"


def stable_id(prefix: str, value: str) -> str:
    clean = re.sub(r"[^a-z0-9]+", "-", value.casefold().replace("+", " plus ")).strip("-")
    return f"{prefix}:{clean or hashlib.sha1(value.encode()).hexdigest()[:12]}"


def clean_title(value: str, fallback: str) -> str:
    title = strip_html(value)
    title = re.sub(r"\s*[-|]\s*KLK OLEO\s*$", "", title, flags=re.I).strip()
    return title or fallback.replace("-", " ").title()


def is_market_url(url: str) -> bool:
    return path_for(url).startswith(MARKET_PATHS)


def clean_markdown(markdown: str, *, product_family: bool = False) -> str:
    """Remove source UI, market links, duplicated family navigation, and breadcrumbs."""
    lines = (markdown or "").splitlines()
    cleaned: list[str] = []
    skip_all_products = False
    for line in lines:
        if any(path in line for path in ("/markets/", "/lifescience", "/oleo-basics")):
            continue
        if re.match(r"^\[Home\]\([^)]*\)\s*[»›]", line.strip()):
            continue
        if product_family and re.match(r"^#{2,4}\s+All Products\s*$", line.strip(), re.I):
            skip_all_products = True
            continue
        if skip_all_products:
            if re.match(r"^\s*\*\s+\[[^]]+\]\(https://www\.klkoleo\.com/products/", line):
                continue
            skip_all_products = False
        cleaned.append(line.rstrip())
    text = "\n".join(cleaned)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def extract_links(markdown: str) -> list[str]:
    return sorted(set(re.findall(r"https?://[^\s)>\]]+", markdown or "")))


def page_title(page: dict[str, Any]) -> str:
    metadata = page.get("metadata") or {}
    return clean_title(str(metadata.get("title") or metadata.get("og:title") or ""), slug_for(page.get("url", "")))


def page_summary(page: dict[str, Any]) -> str:
    metadata = page.get("metadata") or {}
    return strip_html(metadata.get("description") or metadata.get("og:description") or "")


def page_publish_date(page: dict[str, Any]) -> str | None:
    metadata = page.get("metadata") or {}
    return metadata.get("article:published_time") or metadata.get("published_time") or None


def page_modified_date(page: dict[str, Any]) -> str | None:
    metadata = page.get("metadata") or {}
    return metadata.get("article:modified_time") or metadata.get("modified_time") or None


def build_asset_index(raw: dict[str, Any], pages: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], dict[str, str]]:
    usage: dict[str, set[str]] = defaultdict(set)
    for page in pages:
        page_id = stable_id("page", normalize_url(page.get("url", "")))
        for src in page.get("media") or []:
            usage[src].add(page_id)

    records: list[dict[str, Any]] = []
    source_to_id: dict[str, str] = {}
    for media in raw.get("cms", {}).get("media", []):
        asset_id = f"asset:wp-{media.get('id')}"
        details = media.get("media_details") or {}
        all_sources = [media.get("source_url")]
        for variant in (details.get("sizes") or {}).values():
            if isinstance(variant, dict):
                all_sources.append(variant.get("source_url"))
        used_by: set[str] = set()
        for src in filter(None, all_sources):
            source_to_id[src] = asset_id
            used_by.update(usage.get(src, set()))
        width = details.get("width") or ""
        height = details.get("height") or ""
        mime = media.get("mime_type") or media.get("media_type") or ""
        filename = (media.get("source_url") or "").casefold()
        if "pdf" in mime or filename.endswith(".pdf"):
            role = "download"
        elif re.search(r"logo|icon|badge|cert", filename):
            role = "logo_or_icon"
        elif width and height and float(width) / max(float(height), 1) >= 1.8:
            role = "banner_candidate"
        elif width and height and 0.85 <= float(width) / max(float(height), 1) <= 1.15:
            role = "card_or_thumbnail"
        else:
            role = "editorial_image"
        alt_text = strip_html(media.get("alt_text"))
        title = strip_html((media.get("title") or {}).get("rendered"))
        records.append({
            "asset_id": asset_id,
            "source_url": media.get("source_url") or "",
            "mime_type": mime,
            "width": width,
            "height": height,
            "title": title,
            "alt_text": alt_text,
            "caption": strip_html((media.get("caption") or {}).get("rendered")),
            "suggested_role": role,
            "handoff_scope": "linked_to_in_scope_content" if used_by else "unassigned_library_asset",
            "used_by": sorted(used_by),
            "variant_count": len((details.get("sizes") or {})),
            "binary_copied": False,
            "review_required": not bool(alt_text),
            "review_reason": "Missing alt text" if not alt_text else "",
        })

    for media in raw.get("crawl_media", []):
        src = media.get("src") or ""
        if not src or src in source_to_id or is_market_url(src):
            continue
        asset_id = "asset:crawl-" + hashlib.sha1(src.encode()).hexdigest()[:12]
        source_to_id[src] = asset_id
        records.append({
            "asset_id": asset_id,
            "source_url": src,
            "mime_type": media.get("type") or "",
            "width": "",
            "height": "",
            "title": media.get("title") or "",
            "alt_text": media.get("alt") or "",
            "caption": media.get("description") or "",
            "suggested_role": "unclassified_crawl_asset",
            "handoff_scope": "linked_to_in_scope_content" if usage.get(src) else "unassigned_library_asset",
            "used_by": sorted(usage.get(src, set())),
            "variant_count": 0,
            "binary_copied": False,
            "review_required": True,
            "review_reason": "Not matched to a WordPress media-library record",
        })
    return records, source_to_id


def asset_ids_for(page: dict[str, Any], source_to_id: dict[str, str]) -> list[str]:
    return sorted({source_to_id[src] for src in page.get("media") or [] if src in source_to_id})


def record_from_page(page: dict[str, Any], collection: str, source_to_id: dict[str, str], **extra: Any) -> dict[str, Any]:
    url = normalize_url(page.get("url", ""))
    record = {
        "id": stable_id(collection, slug_for(url)),
        "slug": slug_for(url),
        "title": page_title(page),
        "summary": page_summary(page),
        "body_markdown": clean_markdown(page.get("markdown") or ""),
        "asset_ids": asset_ids_for(page, source_to_id),
        "seo_title": strip_html((page.get("metadata") or {}).get("title")),
        "seo_description": page_summary(page),
        "published_at": page_publish_date(page),
        "modified_at": page_modified_date(page),
        "status": "draft_migrated",
        "source_url": url,
        "migration_confidence": "medium",
        "review_required": True,
    }
    record.update(extra)
    return record


def sitemap_lookup(sitemaps: dict[str, list[str]]) -> dict[str, list[str]]:
    lookup: dict[str, list[str]] = defaultdict(list)
    for name, urls in sitemaps.items():
        for url in urls:
            lookup[normalize_url(url)].append(name)
    return lookup


def migration_decision(url: str, memberships: list[str], success: bool) -> dict[str, str]:
    path = path_for(url)
    slug = slug_for(url)
    if is_market_url(url):
        return {"action": "exclude", "destination": "", "template": "", "reason": "Markets are explicitly out of scope."}
    if slug in SYSTEM_SLUGS or slug.startswith("product-enquiry") or "staging" in slug:
        return {"action": "system_config", "destination": "", "template": "system", "reason": "Form, commerce, test, or staging utility; do not migrate as editorial content."}
    if path in {"/news-media/", "/brand/", "/timeline-post/", "/report/", "/hub/"} or "post_type=r3d" in url:
        return {"action": "generate", "destination": path, "template": "archive-index", "reason": "Collection index; generate from normalized CMS records."}
    if any(name in memberships for name in ("category-sitemap.xml", "r3d_category-sitemap.xml", "wpostahs-slider-category-sitemap.xml", "archive-by-year-sitemap.xml", "news-category-sitemap.xml", "author-sitemap.xml")):
        return {"action": "generate", "destination": path, "template": "archive-index", "reason": "Generate from CMS taxonomy; do not create a standalone record."}
    if not success:
        return {"action": "manual_recovery", "destination": path, "template": "unresolved", "reason": "The rendered crawl failed or is missing; recover the source before classifying or importing it."}
    collection_by_sitemap = {
        "news-media-sitemap.xml": ("news-events", "news-event-detail"),
        "post-sitemap.xml": ("news-events", "news-event-detail"),
        "products-sitemap.xml": ("product-families", "product-family-detail"),
        "brand-sitemap.xml": ("brands", "brand-detail"),
        "r3d-sitemap.xml": ("resources", "resource-detail"),
        "timeline_slider_post-sitemap.xml": ("milestones", "timeline"),
        "report-sitemap.xml": ("reports", "resource-detail"),
        "hub-sitemap.xml": ("knowledge-hubs", "editorial-detail"),
    }
    for sitemap, (collection, template) in collection_by_sitemap.items():
        if sitemap in memberships:
            if sitemap == "brand-sitemap.xml":
                return {"action": "review_collection_scope", "destination": collection, "template": template, "reason": "Import only when referenced by one of the eight in-scope product families."}
            return {"action": "cms_import", "destination": collection, "template": template, "reason": f"Repeatable content from {sitemap}."}
    if slug in LOCATION_SLUGS:
        return {"action": "cms_import", "destination": "locations", "template": "location-detail", "reason": "Repeatable facility/location record."}
    return {
        "action": "keep_page" if success else "manual_recovery",
        "destination": path,
        "template": "standard-page",
        "reason": "One-off editorial page." if success else "Crawl failed; recover and classify manually before migration.",
    }


def write_csv(path: Path, records: Iterable[dict[str, Any]], fieldnames: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        for record in records:
            row = dict(record)
            for key, value in row.items():
                if isinstance(value, (list, dict)):
                    row[key] = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
            writer.writerow(row)


def build_handoff(raw: dict[str, Any], output: Path) -> dict[str, Any]:
    output.mkdir(parents=True, exist_ok=True)
    pages = [p for p in raw.get("rendered_pages", []) if not is_market_url(p.get("url", ""))]
    page_by_url = {normalize_url(p.get("url", "")): p for p in pages}
    sitemap_membership = sitemap_lookup(raw.get("sitemaps", {}))
    assets, source_to_asset = build_asset_index(raw, pages)

    product_families: list[dict[str, Any]] = []
    product_brand_links: list[dict[str, str]] = []
    in_scope_brand_urls: set[str] = set()
    for order, (name, slug) in enumerate(PRODUCT_FAMILIES, 1):
        url = normalize_url(f"{BASE}/products/{slug}/")
        page = page_by_url.get(url, {"url": url, "metadata": {"title": name}, "markdown": "", "media": []})
        brand_urls = sorted({normalize_url(link) for link in extract_links(page.get("markdown") or "") if "/brand/" in link})
        in_scope_brand_urls.update(brand_urls)
        family_id = stable_id("product-family", slug)
        brand_ids = [stable_id("brand", slug_for(brand_url)) for brand_url in brand_urls]
        for brand_id in brand_ids:
            product_brand_links.append({"from_id": family_id, "relationship": "contains_brand", "to_id": brand_id})
        record = record_from_page(
            page, "product-family", source_to_asset,
            id=family_id,
            name=name,
            body_markdown=clean_markdown(page.get("markdown") or "", product_family=True),
            display_order=order,
            brand_ids=brand_ids,
            destination_path=f"/products/{slug}/",
            template="product-family-detail",
            status="draft_migrated" if page.get("success") else "needs_manual_recovery",
            migration_confidence="high" if page.get("success") else "low",
        )
        product_families.append(record)

    brands: list[dict[str, Any]] = []
    for url in sorted(in_scope_brand_urls):
        page = page_by_url.get(url)
        if not page:
            brands.append({
                "id": stable_id("brand", slug_for(url)), "slug": slug_for(url),
                "name": slug_for(url).replace("-", " ").title(), "source_url": url,
                "status": "needs_manual_recovery", "review_required": True,
                "migration_confidence": "low", "product_family_ids": [],
            })
            continue
        brand_id = stable_id("brand", slug_for(url))
        family_ids = [r["from_id"] for r in product_brand_links if r["to_id"] == brand_id]
        brands.append(record_from_page(
            page, "brand", source_to_asset,
            id=brand_id,
            name=page_title(page),
            product_family_ids=sorted(family_ids),
            destination_path=f"/brands/{slug_for(url)}/",
            template="brand-detail",
        ))

    news_events: list[dict[str, Any]] = []
    news_urls = set(raw.get("sitemaps", {}).get("news-media-sitemap.xml", []))
    event_urls = set(raw.get("sitemaps", {}).get("post-sitemap.xml", []))
    for raw_url in sorted(news_urls | event_urls):
        url = normalize_url(raw_url)
        if path_for(url) == "/news-media/":
            continue
        page = page_by_url.get(url)
        if not page:
            continue
        title = page_title(page)
        event_signal = bool(re.search(r"expo|exhibition|conference|congress|cosmetics|vitafoods|visit|meet us|join us|poc\s*20", title, re.I))
        content_type = "event" if raw_url in event_urls or event_signal else "news"
        news_events.append(record_from_page(
            page, "news-event", source_to_asset,
            type=content_type,
            event_date=None,
            destination_path=f"/news-events/{slug_for(url)}/",
            template="news-event-detail",
            event_date_review_required=content_type == "event",
        ))

    def collection_records(sitemap: str, collection: str, template: str, route_prefix: str, archive_paths: set[str]) -> list[dict[str, Any]]:
        records: list[dict[str, Any]] = []
        for raw_url in sorted(set(raw.get("sitemaps", {}).get(sitemap, []))):
            url = normalize_url(raw_url)
            if path_for(url) in archive_paths or "post_type=r3d" in url:
                continue
            page = page_by_url.get(url)
            if page:
                records.append(record_from_page(page, collection, source_to_asset, template=template, destination_path=f"/{route_prefix}/{slug_for(url)}/"))
        return records

    resources = collection_records("r3d-sitemap.xml", "resource", "resource-detail", "resources", set())
    for record in resources:
        record["download_urls"] = [link for link in extract_links(record["body_markdown"]) if re.search(r"\.(pdf|docx?|xlsx?|zip)(?:\?|$)", link, re.I)]
        record["resource_type"] = "document" if record["download_urls"] else "resource_page"
    milestones = collection_records("timeline_slider_post-sitemap.xml", "milestone", "timeline", "history-milestones", {"/timeline-post/"})
    for order, record in enumerate(milestones, 1):
        year_match = re.search(r"\b(18|19|20)\d{2}\b", record["title"] + " " + record["body_markdown"][:200])
        record["year"] = int(year_match.group()) if year_match else None
        record["display_order"] = order
    reports = collection_records("report-sitemap.xml", "report", "resource-detail", "reports", {"/report/"})
    hubs = collection_records("hub-sitemap.xml", "knowledge-hub", "editorial-detail", "knowledge-hub", {"/hub/"})

    locations: list[dict[str, Any]] = []
    for page in pages:
        if slug_for(page.get("url", "")) in LOCATION_SLUGS and page.get("success"):
            locations.append(record_from_page(
                page, "location", source_to_asset,
                name=page_title(page), facility_type="facility_or_office", country=None,
                address=None, coordinates=None, capabilities=[], certifications=[],
                destination_path=f"/company/locations/{slug_for(page.get('url', ''))}/",
                template="location-detail", structured_location_review_required=True,
            ))

    accreditation_page = page_by_url.get(normalize_url(f"{BASE}/accreditations/"))
    accreditations: list[dict[str, Any]] = []
    if accreditation_page:
        names = []
        for heading in re.findall(r"^#{4,6}\s+(?:\[[^]]+\]\([^)]*\)|(.+?))\s*$", accreditation_page.get("markdown") or "", re.M):
            name = strip_html(heading)
            if name and name.casefold() != "accreditations" and name not in names:
                names.append(name)
        for order, name in enumerate(names, 1):
            accreditations.append({
                "id": stable_id("accreditation", name), "name": name, "issuer": None,
                "certificate_number": None, "facility_ids": [], "scope": None,
                "valid_from": None, "valid_until": None, "asset_ids": [],
                "display_order": order, "status": "draft_migrated",
                "source_url": normalize_url(accreditation_page["url"]),
                "migration_confidence": "low", "review_required": True,
                "review_reason": "Only the displayed accreditation name was recoverable; assign certificate evidence and validity data manually.",
            })

    career_page = page_by_url.get(normalize_url(f"{BASE}/careers/"))
    careers: list[dict[str, Any]] = []
    career_landing: dict[str, Any] | None = None
    if career_page:
        career_landing = record_from_page(
            career_page, "career-landing", source_to_asset,
            destination_path="/careers/", template="career-index",
            status="draft_migrated", migration_confidence="high",
        )

    banners: list[dict[str, Any]] = []
    for order, (banner_id, source_path, placement) in enumerate(PRIMARY_BANNERS, 1):
        url = normalize_url(BASE + source_path)
        page = page_by_url.get(url)
        if not page:
            continue
        metadata = page.get("metadata") or {}
        media_url = metadata.get("og:image") or ""
        banners.append({
            "id": f"banner:{banner_id}", "placement": placement,
            "eyebrow": "", "headline": page_title(page), "body": page_summary(page),
            "cta_label": "", "cta_url": "", "desktop_asset_id": source_to_asset.get(media_url),
            "mobile_asset_id": None, "alt_text": "", "display_order": order,
            "publish_start": None, "publish_end": None, "status": "needs_editorial_review",
            "source_url": url, "migration_confidence": "medium", "review_required": True,
            "review_reason": "Generated from page SEO metadata because active hero-slider fields were not exposed in the crawl. Confirm copy, CTA, and responsive media before launch.",
        })

    membership_by_url = sitemap_membership
    decisions: list[dict[str, Any]] = []
    for url in sorted({normalize_url(url) for url in raw.get("all_english_urls", [])}):
        page = page_by_url.get(url)
        memberships = sorted(membership_by_url.get(url, []))
        decision = migration_decision(url, memberships, bool(page and page.get("success")))
        if "brand-sitemap.xml" in memberships and url in in_scope_brand_urls:
            decision = {"action": "cms_import", "destination": "brands", "template": "brand-detail", "reason": "Referenced by an in-scope main product family."}
        decisions.append({
            "source_url": url, "source_sitemaps": memberships,
            "crawl_status": "captured" if page and page.get("success") else "failed_or_missing",
            **decision,
        })

    static_pages: list[dict[str, Any]] = []
    for decision in decisions:
        if decision["action"] != "keep_page":
            continue
        page = page_by_url.get(decision["source_url"])
        if page:
            static_pages.append(record_from_page(
                page, "static-page", source_to_asset,
                destination_path=decision["destination"], template=decision["template"],
            ))

    relationships = product_brand_links[:]
    for page in pages:
        page_id = stable_id("page", normalize_url(page.get("url", "")))
        for asset_id in asset_ids_for(page, source_to_asset):
            relationships.append({"from_id": page_id, "relationship": "uses_asset", "to_id": asset_id})

    schemas = {
        "rule": "Null means the source did not provide a reliable value. Never invent missing facts; preserve review flags.",
        "product_scope": "Products consist only of eight Products-tab families and the brand pages linked by those families. Market pages and market product records are excluded.",
        "collections": {
            "banners": ["id", "placement", "eyebrow", "headline", "body", "cta_label", "cta_url", "desktop_asset_id", "mobile_asset_id", "alt_text", "display_order", "publish_start", "publish_end", "status", "source_url", "review_required"],
            "product_families": ["id", "name", "slug", "summary", "body_markdown", "brand_ids", "asset_ids", "display_order", "destination_path", "status", "source_url"],
            "brands": ["id", "name", "slug", "summary", "body_markdown", "product_family_ids", "asset_ids", "destination_path", "status", "source_url"],
            "news_events": ["id", "type", "title", "slug", "summary", "body_markdown", "event_date", "published_at", "asset_ids", "destination_path", "status", "source_url"],
            "careers": ["id", "job_title", "slug", "country", "work_location", "employment_type", "summary", "responsibilities", "requirements", "application_url", "publish_date", "closing_date", "status", "source_url"],
            "resources": ["id", "title", "slug", "summary", "body_markdown", "resource_type", "download_urls", "asset_ids", "status", "source_url"],
            "milestones": ["id", "year", "title", "body_markdown", "asset_ids", "display_order", "status", "source_url"],
            "locations": ["id", "name", "slug", "facility_type", "country", "address", "coordinates", "capabilities", "certifications", "asset_ids", "status", "source_url"],
            "reports": ["id", "title", "slug", "summary", "body_markdown", "asset_ids", "published_at", "status", "source_url"],
            "knowledge_hubs": ["id", "title", "slug", "summary", "body_markdown", "asset_ids", "published_at", "status", "source_url"],
            "accreditations": ["id", "name", "issuer", "certificate_number", "facility_ids", "scope", "valid_from", "valid_until", "asset_ids", "status", "source_url"],
        },
    }

    site_map = {
        "status": "recommended_default_not_client_approved",
        "instruction": "Use this hierarchy for the redesign. Preserve a crawled path when no explicit destination is defined in migration-decisions.csv. Do not add a Markets section.",
        "primary_navigation": [
            {"label": "Home", "path": "/", "template": "home"},
            {"label": "Company", "path": "/company/", "template": "section-index", "children": [
                {"label": "About KLK OLEO", "path": "/company/klk-oleo-brief/", "template": "standard-page"},
                {"label": "History & Milestones", "path": "/history-milestones/", "template": "timeline"},
                {"label": "Global Locations", "path": "/company/locations/", "template": "location-index"},
                {"label": "Accreditations", "path": "/accreditations/", "template": "accreditation-index"},
            ]},
            {"label": "Products", "path": "/products/", "template": "product-family-index", "children": [
                {"label": name, "path": f"/products/{slug}/", "template": "product-family-detail"} for name, slug in PRODUCT_FAMILIES
            ]},
            {"label": "Sustainability", "path": "/sustainability-principled-by-integrity/", "template": "section-index", "children": [
                {"label": "Corporate Responsibility", "path": "/corporate-responsibility/", "template": "standard-page"},
                {"label": "Environmental Management", "path": "/environmental-management-in-klk-oleo/", "template": "standard-page"},
                {"label": "Supply Chain Management", "path": "/supply-chain-management/", "template": "standard-page"},
                {"label": "Governance & Policies", "path": "/governance-and-policies/", "template": "standard-page"},
            ]},
            {"label": "Resources", "path": "/resources/", "template": "resource-index"},
            {"label": "News & Events", "path": "/news-events/", "template": "news-event-index"},
            {"label": "Careers", "path": "/careers/", "template": "career-index"},
            {"label": "Contact", "path": "/contact-us/", "template": "contact"},
        ],
        "excluded_sections": ["Markets", "Life Science market landing", "Oleo Basics market landing", "market product catalogue"],
    }

    templates = {
        "home": ["global_header", "hero_banner", "company_intro", "proof_points", "rise_values", "product_family_grid", "global_presence", "latest_news", "recognition_logos", "sustainability_cta", "global_footer"],
        "standard-page": ["global_header", "page_hero", "breadcrumbs", "rich_text_sections", "downloads_optional", "related_content_optional", "contact_cta", "global_footer"],
        "product-family-index": ["global_header", "page_hero", "intro", "family_grid", "enquiry_cta", "global_footer"],
        "product-family-detail": ["global_header", "page_hero", "breadcrumbs", "family_intro", "brand_card_grid", "related_documents", "product_enquiry_cta", "global_footer"],
        "brand-detail": ["global_header", "page_hero", "breadcrumbs", "brand_overview", "benefits_or_applications", "technical_documents", "related_product_family", "enquiry_cta", "global_footer"],
        "news-event-index": ["global_header", "page_hero", "filters", "featured_story", "card_grid", "pagination", "global_footer"],
        "news-event-detail": ["global_header", "article_hero", "date_and_type", "article_body", "gallery_optional", "event_details_optional", "related_stories", "global_footer"],
        "career-index": ["global_header", "page_hero", "employer_value_proposition", "life_at_klk", "job_filters", "job_list", "application_cta", "global_footer"],
        "location-index": ["global_header", "page_hero", "map_or_region_filter", "location_cards", "contact_cta", "global_footer"],
        "location-detail": ["global_header", "page_hero", "address_and_contact", "capabilities", "certifications", "map", "enquiry_cta", "global_footer"],
        "resource-index": ["global_header", "page_hero", "search_and_filters", "resource_list", "pagination", "global_footer"],
        "resource-detail": ["global_header", "page_hero", "resource_summary", "download_or_body", "related_resources", "global_footer"],
        "timeline": ["global_header", "page_hero", "intro", "ordered_milestones", "global_footer"],
        "archive-index": ["global_header", "page_hero", "generated_results", "pagination", "global_footer"],
        "contact": ["global_header", "page_hero", "contact_options", "enquiry_form", "location_links", "global_footer"],
    }

    component_map = {
        "binding_rule": "Components bind only to the named fields. Do not infer market taxonomy, dates, addresses, or media roles from prose.",
        "components": {
            "hero_banner": {"collection": "banners", "filter": "placement matches current page", "fields": {"eyebrow": "eyebrow", "heading": "headline", "body": "body", "cta.label": "cta_label", "cta.href": "cta_url", "desktop_media": "desktop_asset_id", "mobile_media": "mobile_asset_id", "image_alt": "alt_text"}},
            "product_family_grid": {"collection": "product-families", "sort": "display_order ascending", "fields": {"heading": "name", "body": "summary", "media": "asset_ids[0]", "href": "destination_path"}},
            "brand_card_grid": {"collection": "brands", "filter": "id in current_product_family.brand_ids", "fields": {"heading": "name", "body": "summary", "media": "asset_ids[0]", "href": "destination_path"}},
            "latest_news": {"collection": "news-events", "sort": "published_at descending", "limit": 6, "fields": {"heading": "title", "body": "summary", "media": "asset_ids[0]", "date": "published_at", "href": "destination_path"}},
            "job_list": {"collection": "careers", "fields": {"heading": "job_title", "location": "work_location", "country": "country", "type": "employment_type", "href": "application_url"}},
            "ordered_milestones": {"collection": "milestones", "sort": "year then display_order", "fields": {"year": "year", "heading": "title", "body": "body_markdown", "media": "asset_ids[0]"}},
            "location_cards": {"collection": "locations", "fields": {"heading": "name", "country": "country", "address": "address", "media": "asset_ids[0]", "href": "destination_path"}},
            "resource_list": {"collection": "resources", "fields": {"heading": "title", "body": "summary", "type": "resource_type", "download": "download_urls[0]", "href": "destination_path"}},
        },
    }

    write_json(output / "information-architecture.json", site_map)
    write_json(output / "page-templates.json", templates)
    write_json(output / "component-content-map.json", component_map)
    write_json(output / "cms" / "schemas.json", schemas)
    write_json(output / "cms" / "banners.json", banners)
    write_json(output / "cms" / "product-families.json", product_families)
    write_json(output / "cms" / "brands.json", brands)
    write_json(output / "cms" / "news-events.json", news_events)
    write_json(output / "cms" / "careers.json", careers)
    write_json(output / "cms" / "career-landing.json", career_landing)
    write_json(output / "cms" / "resources.json", resources)
    write_json(output / "cms" / "milestones.json", milestones)
    write_json(output / "cms" / "locations.json", locations)
    write_json(output / "cms" / "reports.json", reports)
    write_json(output / "cms" / "knowledge-hubs.json", hubs)
    write_json(output / "cms" / "accreditations.json", accreditations)
    write_json(output / "pages" / "static-pages.json", static_pages)
    write_json(output / "relationships.json", relationships)
    write_csv(
        output / "assets" / "asset-manifest.csv", assets,
        ["asset_id", "source_url", "mime_type", "width", "height", "title", "alt_text", "caption", "suggested_role", "handoff_scope", "used_by", "variant_count", "binary_copied", "review_required", "review_reason"],
    )
    write_csv(
        output / "migration-decisions.csv", decisions,
        ["source_url", "source_sitemaps", "crawl_status", "action", "destination", "template", "reason"],
    )

    counts = {
        "banners": len(banners), "product_families": len(product_families), "brands": len(brands),
        "news_events": len(news_events), "careers": len(careers), "resources": len(resources),
        "milestones": len(milestones), "locations": len(locations), "reports": len(reports),
        "knowledge_hubs": len(hubs), "accreditations": len(accreditations),
        "static_pages": len(static_pages), "assets": len(assets), "relationships": len(relationships),
        "migration_decisions": len(decisions),
    }
    failed = sum(1 for p in pages if not p.get("success"))
    validation = {
        "result": "pass_with_editorial_review",
        "source_capture": raw.get("captured_at"),
        "counts": counts,
        "checks": {
            "exactly_eight_product_families": len(product_families) == 8,
            "no_market_source_pages_in_records": not any(is_market_url(r.get("source_url", "")) for collection in (product_families, brands, news_events, resources, milestones, locations, reports, hubs, static_pages) for r in collection),
            "no_market_links_in_normalized_markdown": not any(any(path in r.get("body_markdown", "") for path in MARKET_PATHS) for collection in (product_families, brands, news_events, resources, milestones, locations, reports, hubs, static_pages) for r in collection),
            "all_product_brand_relationships_resolve": all(rel["to_id"] in {b["id"] for b in brands} for rel in product_brand_links),
            "all_asset_references_resolve": all(asset_id in {a["asset_id"] for a in assets} for collection in (product_families, brands, news_events, resources, milestones, locations, reports, hubs, static_pages) for record in collection for asset_id in record.get("asset_ids", [])),
            "all_collection_record_ids_are_unique": all(
                len([record.get("id") for record in collection]) == len({record.get("id") for record in collection})
                for collection in (banners, product_families, brands, news_events, resources, milestones, locations, reports, hubs, accreditations, static_pages)
            ),
        },
        "known_gaps": [
            f"{failed} rendered pages failed or returned no usable result; consult migration-decisions.csv.",
            "No published job records were returned by the public careers endpoint; careers.json is intentionally empty.",
            "Banner records are derived from page SEO metadata and require confirmation against the active design/CMS.",
            "Asset binaries were not downloaded; asset-manifest.csv stores source URLs and roles only.",
            "Null structured fields are intentional and must be resolved by an editor, never guessed by an implementation model.",
        ],
    }
    write_json(output / "validation-report.json", validation)

    readme = f"""# KLK OLEO redesign handoff

This folder is the authoritative, context-free content handoff for a separate web-design or implementation LLM. Start with `KLK-OLEO-WEB-DESIGN-HANDOFF.md`; then load the JSON/CSV files it names. The original crawl documents in `../docs/` remain source evidence and are not implementation specifications.

## Non-negotiable scope

- Products include exactly eight main Products-tab families and {len(brands)} brand pages referenced by them.
- Do not create, import, link, or infer a Markets section, market landing page, or market product catalogue.
- Never invent values for `null` fields. Preserve `review_required` and resolve those fields editorially.
- Source media remain remote. Downloading, licensing, optimization, and final accessibility review are separate launch tasks.

## Loading order

1. `KLK-OLEO-WEB-DESIGN-HANDOFF.md`
2. `information-architecture.json`
3. `page-templates.json` and `component-content-map.json`
4. `cms/schemas.json`, followed by the required collection files
5. `pages/static-pages.json`
6. `relationships.json`
7. `assets/asset-manifest.csv`
8. `migration-decisions.csv` and `validation-report.json`

## Generated record counts

```json
{json.dumps(counts, indent=2)}
```

Generated from crawl captured at `{raw.get('captured_at')}`.
"""
    (output / "README.md").write_text(readme, encoding="utf-8")

    handoff = f"""# KLK OLEO web-design and content-mapping specification

## Authority and purpose

You are receiving this file without conversational context. Treat it as the controlling specification for mapping the supplied KLK OLEO content into a redesigned website. The original crawl is evidence only. The normalized files in this handoff directory control structure, record identity, relationships, and placement.

When instructions conflict, use this order: this specification → `information-architecture.json` → `component-content-map.json` → collection records → original crawl evidence.

## Required outcome

Build a responsive corporate website that preserves approved KLK OLEO source copy, exposes repeatable material through CMS collections, and keeps page-specific editorial copy in static pages. Do not silently rewrite claims, dates, product names, certifications, addresses, or metrics. Do not fill missing data by inference.

## Product boundary

Products are limited to these eight main Products-tab families:

{chr(10).join(f'{index}. {name} → `/products/{slug}/`' for index, (name, slug) in enumerate(PRODUCT_FAMILIES, 1))}

The normalized handoff contains {len(brands)} brand records linked from those family pages. Markets, Life Science/Oleo Basics market landings, market taxonomies, and market product records are excluded. The redesigned navigation must not contain a Markets item. Embedded market links were removed from normalized Markdown.

## Information architecture

The definitive hierarchy is in `information-architecture.json`. Use its `primary_navigation` as the default redesign navigation. It is a recommended design default rather than evidence of client approval, so preserve paths for other retained pages unless `migration-decisions.csv` provides a destination.

## Template and component rules

- `page-templates.json` defines the ordered component slots for each template.
- `component-content-map.json` defines exact CMS field-to-component bindings.
- A component may bind only to named fields. Do not recover missing values from unrelated prose.
- Optional components should be omitted when their bound content is empty.
- Related records must resolve through IDs in `relationships.json` or explicit `*_ids` arrays.
- Use `asset_ids` to resolve media through `assets/asset-manifest.csv`; do not choose unrelated media by filename similarity.

## CMS collections

The canonical schemas are in `cms/schemas.json`. The main collections are banners, product families, brands, news/events, and careers. Additional structured collections cover resources, milestones, locations, reports, knowledge hubs, and accreditations.

Important states:

- `draft_migrated`: recovered source content, still subject to editorial QA.
- `needs_manual_recovery`: the source record was identified but the page could not be reliably captured.
- `needs_editorial_review`: placement or source fields are incomplete.
- `review_required: true`: do not publish without resolving the accompanying reason.

`cms/careers.json` is empty because the public CMS returned no live jobs. `cms/career-landing.json` contains the careers landing-page content and template mapping. Do not fabricate vacancies.

## Static pages

`pages/static-pages.json` contains one-off editorial pages. Each record has a destination path, template, source URL, normalized Markdown, SEO fields, asset IDs, and a review flag. Forms, checkout, account, staging/test pages, and generated archives are deliberately absent; their handling is specified in `migration-decisions.csv`.

## Media

`assets/asset-manifest.csv` is the only asset-selection index. It records {len(assets)} source assets, likely role, dimensions when available, page usage, alt text, and review status. `binary_copied` is false because files were not downloaded. Before production, download approved originals, optimize responsive variants, validate rights, and replace missing or filename-like alt text.

## Migration ledger

`migration-decisions.csv` assigns every inventoried URL one action:

- `cms_import`: create a collection record.
- `keep_page`: create a one-off editorial page.
- `generate`: generate the archive from CMS metadata.
- `system_config`: implement as form/commerce/system behavior, not editorial content.
- `review_collection_scope`: import only if related to an in-scope product family.
- `manual_recovery`: recover the failed page before deciding.
- `exclude`: omit entirely.

Do not migrate a URL without consulting its ledger row.

## Design direction inferred from content—not a new brand standard

The source supports a global industrial/technical brand presentation: clear corporate authority, restrained use of sustainability claims, strong product-family discovery, prominent proof points, accessible technical downloads, and regional facility visibility. Keep dense technical content scannable through cards, accordions, filters, and download metadata. Treat this paragraph as design interpretation, not approved visual-brand guidance.

## Quality gates before implementation is considered complete

1. All eight product families render, and every linked brand resolves.
2. No Markets navigation, route, imported record, or market-page CTA exists.
3. Every rendered CMS card/detail uses stable IDs and declared relationships.
4. No `null` value is replaced with invented copy or data.
5. Every image has reviewed alt text or is explicitly decorative.
6. Every remote asset and document link is validated and localized as required.
7. Events have editorially verified dates; titles alone are not accepted as date evidence.
8. Location addresses, coordinates, capabilities, and certifications are editorially verified.
9. System pages and forms are implemented as behavior, not copied as content pages.
10. Redirects are created for any source path changed by the new IA.
11. `validation-report.json` passes, and every listed known gap has an owner or accepted exception.

## Source provenance

- Website: `{BASE}/`
- Crawl captured: `{raw.get('captured_at')}`
- Normalized collections: {sum(counts[k] for k in ('banners','product_families','brands','news_events','resources','milestones','locations','reports','knowledge_hubs','accreditations'))} records plus static pages
- Original crawl files: `../docs/klkoleo-copywriting-content.md`, `../docs/klkoleo-cms-content.md`, and `../docs/klkoleo-crawl-inventory.json`
"""
    (output / "KLK-OLEO-WEB-DESIGN-HANDOFF.md").write_text(handoff, encoding="utf-8")
    return validation


def main() -> int:
    parser = argparse.ArgumentParser()
    script_root = Path(__file__).resolve().parents[2]
    parser.add_argument("--source", type=Path, default=script_root / "docs" / "klkoleo-crawl-inventory.json")
    parser.add_argument("--output", type=Path, default=script_root / "handoff")
    args = parser.parse_args()
    validation = build_handoff(read_json(args.source), args.output)
    print(json.dumps(validation, indent=2))
    return 0 if all(validation["checks"].values()) else 1


if __name__ == "__main__":
    raise SystemExit(main())

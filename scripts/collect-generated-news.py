"""Collect the official public news archive into new-page content only."""
import concurrent.futures
import datetime
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse, unquote
import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src/lib/generated'
ASSETS = ROOT / 'public/images/generated/news'
OUT.mkdir(parents=True, exist_ok=True)
ASSETS.mkdir(parents=True, exist_ok=True)
errors = []

def soup(url):
    response = requests.get(url, timeout=45)
    response.raise_for_status()
    return BeautifulSoup(response.content.decode('utf-8', errors='replace'), 'html.parser')

def image(url):
    if not url or not url.startswith('http'):
        return None
    name = hashlib.sha256(url.encode()).hexdigest()[:10] + '-' + unquote(urlparse(url).path.split('/')[-1])
    path = ASSETS / name
    if not path.exists():
        try:
            response = requests.get(url, timeout=45)
            response.raise_for_status()
            path.write_bytes(response.content)
        except Exception as exc:
            errors.append(f'Image {url}: {exc}')
            return None
    return '/images/generated/news/' + name

def collect_links(page):
    url = 'https://www.klkoleo.com/news-media/' + (f'page/{page}/' if page > 1 else '')
    doc = soup(url)
    return list(dict.fromkeys(a['href'] for a in doc.select('a[href]') if '/news-media/' in a['href'] and '/page/' not in a['href'] and a['href'].rstrip('/').split('/')[-1] != 'news-media' and '/de/' not in a['href'] and '/cn/' not in a['href']))

def article(url):
    try:
        doc = soup(url)
        body = doc.select_one('.npost-content')
        if not body:
            raise ValueError('Article body missing')
        title = doc.select_one('main .content h1').get_text(' ', strip=True)
        stamp = doc.select_one('.single-post-date')
        date = datetime.datetime.strptime(stamp.get_text(strip=True), '%d %b %Y').strftime('%Y-%m-%d') if stamp else None
        sections = []
        current = {'paragraphs': []}
        for node in body.children:
            if not getattr(node, 'name', None):
                continue
            if node.name in ['script', 'style', 'noscript']:
                continue
            if node.name in ['h1', 'h2', 'h3', 'h4', 'h5']:
                if current.get('paragraphs') or current.get('image') or current.get('links'):
                    sections.append(current)
                current = {'heading': node.get_text(' ', strip=True), 'paragraphs': []}
                continue
            for img in node.select('img'):
                asset = image(img.get('data-lazy-src') or img.get('src'))
                if asset:
                    if current.get('image'):
                        sections.append(current)
                        current = {'paragraphs': []}
                    current['image'] = asset
            text = node.get_text(' ', strip=True).replace('\xa0', ' ').strip()
            if text:
                current['paragraphs'].append(text)
            for link in node.select('a[href]'):
                href = link['href']
                label = link.get_text(' ', strip=True)
                if label and href.startswith(('http', 'mailto:')):
                    current.setdefault('links', []).append({'label': label, 'href': href})
        if current.get('paragraphs') or current.get('image') or current.get('links'):
            sections.append(current)
        words = title.lower()
        category = 'Corporate' if any(w in words for w in ['anniversary', 'homepage', 'celebrating', 'acquisition', 'partnership', 'award', 'joint venture']) else 'Exhibition'
        if any(w in words for w in ['chemexpo', 'latin america 2026']):
            category = 'Products'
        if any(w in words for w in ['sustainability report', 'carbon', 'iscc', 'sustainable palm']):
            category = 'Sustainability'
        result = {'slug': 'news-events/' + url.rstrip('/').split('/')[-1], 'title': title, 'source': url, 'category': category, 'sections': sections}
        if date:
            result['date'] = date
        asset = next((s['image'] for s in sections if s.get('image')), None)
        if asset:
            result['image'] = asset
        return result
    except Exception as exc:
        errors.append(f'{url}: {exc}')
        return None

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
    links = list(dict.fromkeys(url for batch in executor.map(collect_links, range(1, 11)) for url in batch))[:100]
    articles = [a for a in executor.map(article, links) if a]
articles.sort(key=lambda a: a.get('date', ''), reverse=True)
(OUT / 'news.json').write_text(json.dumps(articles, ensure_ascii=False, indent=2), encoding='utf-8')

locales = []
for language in ['de', 'cn']:
    url = f'https://www.klkoleo.com/{language}/'
    try:
        doc = soup(url)
        main = doc.select_one('main') or doc
        sections = []
        for section in main.select('section'):
            heading = section.find(['h1', 'h2', 'h3'])
            paragraphs = list(dict.fromkeys(p.get_text(' ', strip=True) for p in section.select('p') if len(p.get_text(' ', strip=True)) > 40))
            if paragraphs:
                block = {'paragraphs': paragraphs}
                if heading:
                    block['heading'] = heading.get_text(' ', strip=True)
                sections.append(block)
        if not sections:
            raise ValueError('No homepage sections found')
        locales.append({'slug': language, 'title': 'KLK OLEO — Deutsch' if language == 'de' else 'KLK OLEO — 中文', 'source': url, 'sections': sections})
    except Exception as exc:
        errors.append(f'{url}: {exc}')
(OUT / 'locales.json').write_text(json.dumps(locales, ensure_ascii=False, indent=2), encoding='utf-8')
report = ROOT / 'docs/research/generated/news.md'
report.parent.mkdir(parents=True, exist_ok=True)
report.write_text('# Official news content\n\nCollected ' + str(len(articles)) + ' article details from all ten public news archive pages on 2026-10-07. Existing page files were not edited. Body paragraphs, headings, outbound resources and downloaded article images are preserved in new JSON content. Categories are inferred from article titles where the source does not expose categories. Dates use official detail pages, which can differ from the existing prototype listing.\n\nGerman and Chinese homepage source sections are provided as two local landing pages; this does not represent translation of every route.\n\n## Source failures\n\n' + ('\n'.join(errors) if errors else 'None.') + '\n', encoding='utf-8')
print(json.dumps({'articles': len(articles), 'locales': len(locales), 'errors': errors}, ensure_ascii=False))

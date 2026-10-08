"""Collect official operating-company profiles without touching existing pages."""
import concurrent.futures
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.klkoleo.com/'
PATHS = ['klkemmerich', 'klktensachem', 'ksp-manufacturing-sdn-bhd', 'palmamide-sdn-bhd',
         'palm-oleo-sdn-bhd', 'palm-oleo-klang-sdn-bhd', 'kl-kepong-oleomas-sdn-bhd',
         'klk-bioenergy-sdn-bhd', 'davoslife', 'taiko-palm-oleo-zhangjiagang-co-ltd',
         'pt-klk-dumai', 'stolthavenwestport', 'ptperindustriansawitsynergi',
         'klkoleo-india', 'klktemix', 'klk-oleo-americas-inc']


def clean(element):
    return re.sub(r'\s+', ' ', element.get_text(' ', strip=True)).strip()


def download(url, name):
    response = requests.get(url, timeout=45)
    response.raise_for_status()
    extension = Path(urlparse(url).path).suffix or '.jpg'
    file = ROOT / 'public/images/generated/facilities' / (name + extension)
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_bytes(response.content)
    return '/images/generated/facilities/' + file.name


def collect(path):
    source = BASE + path + '/'
    response = requests.get(source, timeout=45)
    response.raise_for_status()
    raw = response.content.decode('utf-8', errors='surrogateescape')
    raw = ''.join(bytes([ord(c) - 0xDC00]).decode('cp1252', errors='replace')
                  if 0xDC80 <= ord(c) <= 0xDCFF else c for c in raw)
    soup = BeautifulSoup(raw, 'html.parser')
    for email in soup.select('[data-cfemail]'):
        encoded = bytes.fromhex(email['data-cfemail'])
        email.string = ''.join(chr(byte ^ encoded[0]) for byte in encoded[1:])
    main = soup.select_one('main')
    if not main:
        raise ValueError('No editorial main content')
    heading = main.select_one('h1')
    title = clean(heading) if heading else path.replace('-', ' ').title()
    content = main.select_one('.content') or main
    sections = []
    current = {'heading': title, 'paragraphs': []}
    for element in content.select('h1,h2,h3,p'):
        if element.find_parent('form') or element.get('id') == 'breadcrumbs':
            continue
        value = clean(element)
        if not value or 'Download Enquiry' in value or 'Country*' in value:
            continue
        if element.name.startswith('h'):
            if current['paragraphs']:
                sections.append(current)
            current = {'heading': value, 'paragraphs': []}
        elif value not in current['paragraphs']:
            current['paragraphs'].append(value)
    if current['paragraphs']:
        sections.append(current)
    if path == 'davoslife':
        title = 'Davos Life Science'
        about = next(s for s in sections if s['heading'] == 'ABOUT DAVOS LIFE SCIENCE' and len(s['paragraphs']) > 1)
        sections = [{'heading': 'Davos Life Science', 'paragraphs': [p for p in about['paragraphs'] if p != 'READ MORE']}]
    image_wrapper = content.select_one('.img-wrapper')
    if image_wrapper:
        contact = BeautifulSoup(str(image_wrapper), 'html.parser')
        for e in contact.select('img,noscript,script'):
            e.decompose()
        lines = [re.sub(r'\s+', ' ', s).strip() for s in contact.stripped_strings]
        lines = list(dict.fromkeys(s for s in lines if s))
        if lines:
            sections.append({'heading': 'Contact information', 'paragraphs': lines})
    images = content.select('img')
    photo = next((i.get('data-lazy-src') or i.get('src') for i in images
                  if (i.get('data-lazy-src') or i.get('src', '')).startswith('https://')), None)
    if photo and sections:
        sections[0]['image'] = download(photo, path + '-profile')
    links = []
    seen = set()
    for a in content.select('a[href]'):
        label = clean(a)
        href = urljoin(source, a['href'])
        if not label or href in seen or href.startswith('javascript:'):
            continue
        if href.startswith(BASE + 'wp-content') or 'klkoleo.com' not in urlparse(href).netloc or a['href'].startswith('mailto:'):
            links.append({'label': label, 'href': href})
            seen.add(href)
    links.extend([{'label': 'Contact Us', 'href': '/contact-us'}, {'label': 'Product Enquiry', 'href': '/product-enquiry'}])
    sections.append({'heading': 'Get in touch', 'paragraphs': [], 'links': links})
    slug = 'company/davos-life-science' if path == 'davoslife' else path
    page = {'slug': slug, 'title': title, 'source': source, 'category': 'Global Presence', 'sections': sections}
    banner = main.select_one('.page-featured-banner')
    match = re.search(r'url\([\'\"]?([^\)\'\"]+)', banner.get('style', '')) if banner else None
    image_source = match.group(1) if match else photo
    if image_source:
        page['image'] = download(image_source, path + '-banner')
    return page, f'## {title}\n\nSource: {source}\nFinal response URL: {response.url}\nLocal path: /{slug}\nSections: {len(sections)}\nBanner source: {image_source}\nProfile image source: {photo}\n'


pages = []
notes = ['# Generated operating-company profiles', '', 'Sources checked 7 October 2026. Existing pages and assets were not edited.', '']
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    futures = {pool.submit(collect, path): path for path in PATHS}
    for future in concurrent.futures.as_completed(futures):
        path = futures[future]
        try:
            page, note = future.result()
            pages.append(page)
            notes.append(note)
        except Exception as error:
            notes.append(f'## Unavailable: {path}\n\n{error}\n')
            print('UNAVAILABLE', path, error)
pages.sort(key=lambda page: page['slug'])
current_palm = next(page for page in pages if page['slug'] == 'palm-oleo-sdn-bhd')
for path, title in [('ksp-manufacturing-sdn-bhd', 'KSP Manufacturing Sdn. Bhd.'), ('palmamide-sdn-bhd', 'Palmamide Sdn. Bhd.')]:
    if not any(page['slug'] == path for page in pages):
        pages.append({
            'slug': path, 'title': title, 'category': 'Global Presence',
            'source': BASE + 'palm-oleo-sdn-bhd/', 'image': current_palm['image'],
            'sections': [
                {'heading': 'Operations merged into Palm-Oleo', 'paragraphs': ['In 2021, KSP Manufacturing Sdn Bhd and Palmamide Sdn Bhd’s operations are merged into Palm-Oleo.']},
                {'heading': 'Palm-Oleo Sdn. Bhd.', 'paragraphs': [current_palm['sections'][0]['paragraphs'][0]],
                 'links': [{'label': 'Palm-Oleo company profile', 'href': '/palm-oleo-sdn-bhd'}, {'label': 'Contact Us', 'href': '/contact-us'}]},
            ],
        })
        notes.append(f'## {title}\n\nThe old official URL /{path}/ returns404. Local profile uses the current Palm-Oleo merger information from {BASE}palm-oleo-sdn-bhd/ and links to its current company profile.\n')
file = ROOT / 'src/lib/generated/facilities.json'
file.parent.mkdir(parents=True, exist_ok=True)
file.write_text(json.dumps(pages, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
research = ROOT / 'docs/research/generated/facilities.md'
research.parent.mkdir(parents=True, exist_ok=True)
research.write_text('\n'.join(notes), encoding='utf-8')
print([(p['slug'], p['title'], len(p['sections'])) for p in pages])

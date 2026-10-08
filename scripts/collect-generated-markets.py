"""Collect official market editorial copy and representative ingredient information."""
import json
import re
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.klkoleo.com/'
MARKETS = [
    ('beauty-personal-care', 'Beauty & Personal Care', 'markets/beauty-personal-care/'),
    ('food-nutrition', 'Food & Nutrition', 'markets/food-nutrition/'),
    ('home-care-industries-institutional-ii-cleaning', 'Home Care, Industries & Institutional (I&I) Cleaning', 'markets/home-care-industries-institutional-ii-cleaning/'),
    ('life-science', 'Life Science', 'lifescience/'),
    ('lubricants', 'Lubricants', 'markets/lubricants/'),
    ('oleo-basics', 'Oleo Basics', 'oleo-basics/'),
    ('polymers', 'Polymers', 'markets/polymers/'),
]


def soup_for(url):
    response = requests.get(url, timeout=45)
    response.raise_for_status()
    # The source mixes Windows punctuation into documents declared as UTF-8.
    raw = response.content.decode('utf-8', errors='surrogateescape')
    raw = ''.join(bytes([ord(c) - 0xDC00]).decode('cp1252', errors='replace')
                  if 0xDC80 <= ord(c) <= 0xDCFF else c for c in raw)
    return BeautifulSoup(raw, 'html.parser')


def text(element):
    return re.sub(r'\s+', ' ', element.get_text(' ', strip=True)).strip()


def download(url, slug):
    if not url or not url.startswith('https://'):
        return None
    response = requests.get(url, timeout=45)
    response.raise_for_status()
    extension = Path(urlparse(url).path).suffix or '.jpg'
    target = ROOT / 'public/images/generated/markets' / (slug + extension)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(response.content)
    return '/images/generated/markets/' + target.name


pages = []
notes = ['# Generated market pages', '', 'Source checked 7 October 2026. Existing pages and assets were not edited.', '']
for slug, title, source_path in MARKETS:
    source = BASE + source_path
    soup = soup_for(source)
    main = soup.select_one('main')
    sections = []
    description = main.select_one('.custom-term-description')
    image_url = None
    if description:
        heading = description.select_one('h1')
        heading_text = text(heading) if heading else title
        if heading:
            heading.decompose()
        paragraphs = [p.strip() for p in re.split(r'\r+|\n+', description.get_text(' ', strip=True)) if p.strip()]
        sections.append({'heading': heading_text, 'paragraphs': paragraphs})
        # Banner images are real official campaign artwork; use a market-specific one where available.
        images = main.select('.ninja-market-slider img')
        candidates = [i.get('data-lazy-src') or i.get('src') for i in images]
        image_url = next((i for i in candidates if i and not i.startswith('data:') and 'Canva-Banner' not in i), None)
        for product in main.select('ul.products > li.product'):
            h = product.select_one('h2')
            paragraphs = [text(li) for li in product.select('.nmarket-detail-list > li')]
            for li in product.select('.nmarket-atrribute-list > li'):
                labels = list(dict.fromkeys(i.get('alt') for i in li.select('img[alt]') if i.get('alt')))
                if labels:
                    paragraphs.append(text(li.select_one('b')) + ' ' + ', '.join(labels))
            if h and paragraphs:
                sections.append({'heading': text(h), 'paragraphs': paragraphs})
        for filter_element in main.select('#market-sidebar .prdctfltr_filter'):
            heading = filter_element.select_one('h3')
            labels = list(dict.fromkeys(text(e) for e in filter_element.select('label .prdctfltr_customization_search') if text(e) not in ('None', '')))
            if heading and labels:
                sections.append({'heading': text(heading), 'paragraphs': [', '.join(labels)]})
        sections.append({'heading': 'Explore the complete ingredient portfolio', 'paragraphs': [], 'links': [
            {'label': 'Complete market ingredient catalogue', 'href': source},
            {'label': 'Product Enquiry', 'href': '/product-enquiry'},
        ]})
    elif slug == 'life-science':
        elements = main.select('h1,h2,h3,h4,p,li')
        current = {'heading': 'Excipients derived from nature, driven by innovation', 'paragraphs': []}
        for e in elements:
            value = text(e)
            if not value or value in ('ABOUT US', 'WHAT WE DO', 'WHY CHOOSE US', 'PRODUCT EXPLORER', 'FEATURE', 'RELEASE'):
                continue
            if value == 'Latest News':
                break
            if e.name.startswith('h'):
                if current['paragraphs']:
                    sections.append(current)
                current = {'heading': value, 'paragraphs': []}
            else:
                if value not in current['paragraphs']:
                    current['paragraphs'].append(value)
        if current['paragraphs']:
            sections.append(current)
        backgrounds = re.findall(r'https[^\s"\)]+\.(?:webp|jpg|png)', str(main))
        image_url = next((i for i in backgrounds if 'banner' in i.lower() or 'hero' in i.lower()), None)
        sections.append({'heading': 'Partner with the science of life', 'paragraphs': ['Reach out today to collaborate with KLK OLEO Life Science—advancing formulation innovation and sustainable excellence together.'], 'links': [
            {'label': 'Explore KLK OLEO Life Science', 'href': source},
            {'label': 'Product Enquiry', 'href': '/product-enquiry'},
        ]})
    else:
        # Oleo Basics has editorial paragraphs and detailed industry/application tables.
        current = {'heading': title, 'paragraphs': []}
        for e in main.select('h1,h2,h3,p,table'):
            if e.find_parent(['table', 'form']):
                continue
            value = text(e)
            if 'Download Enquiry' in value or 'Country*' in value:
                break
            if not value:
                continue
            if e.name.startswith('h'):
                if current['paragraphs']:
                    sections.append(current)
                current = {'heading': value, 'paragraphs': []}
            elif e.name == 'table':
                current['paragraphs'].extend(text(row) for row in e.select('tr') if text(row))
            else:
                current['paragraphs'].append(value)
        if current['paragraphs']:
            sections.append(current)
        if sections:
            original = sections[0]['paragraphs']
            introduction = original[:2]
            range_copy = original[2]
            applications = original[4:-1]
            sections = [
                {'heading': 'A Universal Natural Solution For Basic to Niche Applications', 'paragraphs': introduction},
                {'heading': 'KLK OLEO’s Oleo Basics', 'paragraphs': [range_copy, 'PALMERA Fatty Acids, PALMERA Glycerine, PALMERE Methyl Esters, PALMEROL Fatty Alcohols, PALMERGY Biodiesels and PLANTERA Fatty Acids.']},
                {'heading': 'Applications of Oleochemicals', 'paragraphs': applications},
                {'heading': 'Oleochemical derivatives', 'paragraphs': ['Oleo Basics can be further reacted with other chemicals to produce oleochemical derivatives.']},
                {'heading': 'Fatty Acids', 'paragraphs': ['Partial glycerides, fatty acid esters, fatty acid ethoxylates, soaps and metal soaps.']},
                {'heading': 'Glycerine', 'paragraphs': ['Polyglycerol esters, polyglycerol, partial glycerides, fatty amines and triacetin.']},
                {'heading': 'Methyl Esters', 'paragraphs': ['Fatty acid alkanolamides, methyl ester sulphonate, esterquats and soaps.']},
                {'heading': 'Fatty Alcohols', 'paragraphs': ['Alkyl chlorides, fatty alcohol ethoxylates, fatty alcohol sulphates, esters and fatty alcohol ether sulphates.']},
                {'heading': 'Innovate responsibly', 'paragraphs': [original[-1]]},
            ]
        image = main.select_one('img.nbox-shadow')
        image_url = image.get('data-lazy-src') or image.get('src') if image else None
        sections.append({'heading': 'Oleo Basics products', 'paragraphs': [], 'links': [
            {'label': 'Fatty Acids', 'href': '/products/fatty-acids'},
            {'label': 'Glycerine', 'href': '/products/glycerine'},
            {'label': 'Fatty Alcohols', 'href': '/products/fatty-alcohols'},
            {'label': 'Product Enquiry', 'href': '/product-enquiry'},
        ]})
    page = {'slug': 'markets/' + slug, 'title': title, 'category': 'Markets', 'source': source, 'sections': sections}
    if image_url:
        try:
            page['image'] = download(image_url, slug)
        except requests.RequestException as error:
            notes.append(f'Asset unavailable: {image_url}: {error}')
    pages.append(page)
    notes.extend([f'## {title}', '', f'Source: {source}', f'Local path: /markets/{slug}', f'Sections: {len(sections)}', f'Banner asset source: {image_url or "No editorial banner found; shared theme fallback used"}', '',
                  'Ingredient catalogue pages include the official introduction, first four listed ingredients and available functionality/application labels. The complete source catalogue is linked; source pagination/filtering has not been imitated.', '' if description else ''])

output = ROOT / 'src/lib/generated/markets.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(pages, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
research = ROOT / 'docs/research/generated/markets.md'
research.parent.mkdir(parents=True, exist_ok=True)
research.write_text('\n'.join(notes), encoding='utf-8')
print([(page['slug'], len(page['sections']), page.get('image')) for page in pages])

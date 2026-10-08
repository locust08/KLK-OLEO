"""Collect every official paginated market ingredient record for local searching."""
import concurrent.futures
import json
import re
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.klkoleo.com/markets/'
MARKETS = ['beauty-personal-care', 'food-nutrition', 'home-care-industries-institutional-ii-cleaning', 'lubricants', 'polymers']


def clean(element):
    return re.sub(r'\s+', ' ', element.get_text(' ', strip=True)).strip()


def soup_for(url):
    for attempt in range(3):
        try:
            response = requests.get(url, timeout=60)
            response.raise_for_status()
            raw = response.content.decode('utf-8', errors='surrogateescape')
            raw = ''.join(bytes([ord(c) - 0xDC00]).decode('cp1252', errors='replace')
                          if 0xDC80 <= ord(c) <= 0xDCFF else c for c in raw)
            return BeautifulSoup(raw, 'html.parser')
        except requests.RequestException:
            if attempt == 2:
                raise
            time.sleep(1 + attempt)


def records(soup, source):
    output = []
    for product in soup.select('main ul.products > li.product'):
        heading = product.select_one('h2')
        if not heading:
            continue
        record = {'name': clean(heading), 'description': '', 'functionalities': [], 'applications': [], 'source': source}
        title_link = heading.select_one('a[href]') or product.select_one('a.woocommerce-LoopProduct-link')
        if title_link:
            record['source'] = urljoin(source, title_link['href'])
        for detail in product.select('.nmarket-detail-list > li'):
            label = detail.select_one('b')
            key = clean(label).lower() if label else ''
            if label:
                label.decompose()
            value = clean(detail)
            if 'name' in key:
                record['inci'] = value
            elif value:
                record['description'] += (' ' if record['description'] else '') + value
        for attribute in product.select('.nmarket-atrribute-list > li'):
            label = attribute.select_one('b')
            key = clean(label).lower() if label else ''
            values = list(dict.fromkeys(image.get('alt') for image in attribute.select('img[alt]') if image.get('alt')))
            if 'functionalit' in key:
                record['functionalities'] = values
            elif 'application' in key:
                record['applications'] = values
            elif 'health' in key and values:
                record['description'] += ' Health Benefits: ' + ', '.join(values) + '.'
        output.append(record)
    if not output:
        raise ValueError('No market ingredients in ' + source)
    return output


catalogues = {}
notes = ['# Complete market ingredient catalogues', '', 'Collected from official KLK OLEO paginated ingredient pages on 7 October 2026.', '', 'Every record retains source ingredient name, description, INCI/ingredient name where supplied, functionality/application icon labels and source page URL. The official listing does not link ingredient titles to detail URLs, so records retain their originating market catalogue page URL.', '']
for market in MARKETS:
    source = BASE + market + '/'
    first = soup_for(source)
    pagination = first.select_one('.wp-pagenavi-pagination')
    match = re.search(r'Page\s+1\s+of\s+(\d+)', clean(pagination))
    maximum = int(match.group(1)) if match else 1
    pages = {1: records(first, source)}
    urls = [source]
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        pending = {}
        for page in range(2, maximum + 1):
            url = source + f'page/{page}/'
            pending[pool.submit(soup_for, url)] = (page, url)
        for future in concurrent.futures.as_completed(pending):
            number, url = pending[future]
            pages[number] = records(future.result(), url)
            urls.append(url)
    combined = [record for number in sorted(pages) for record in pages[number]]
    # Preserve distinct formulations but eliminate repeated exact records caused by cached pagination.
    seen = set()
    unique = []
    for record in combined:
        identity = (record['name'], record.get('inci'), record['description'])
        if identity not in seen:
            seen.add(identity)
            unique.append(record)
    catalogues['markets/' + market] = unique
    notes.extend([f'## {market}', '', f'Source: {source}', f'Fetched pages: {len(pages)} / {maximum}', f'Raw records: {len(combined)}', f'Unique ingredient records: {len(unique)}', '', 'Fetched URLs:', *('- ' + url for url in sorted(urls)), ''])
    print(market, 'pages:', len(pages), 'records:', len(combined), 'unique:', len(unique), flush=True)

output = ROOT / 'src/lib/generated/market-catalogues.json'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(json.dumps(catalogues, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
research = ROOT / 'docs/research/generated/market-catalogues.md'
research.parent.mkdir(parents=True, exist_ok=True)
research.write_text('\n'.join(notes), encoding='utf-8')
print('Complete:', sum(len(values) for values in catalogues.values()), 'unique market ingredient records.')

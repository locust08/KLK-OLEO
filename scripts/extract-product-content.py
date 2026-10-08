from html.parser import HTMLParser
from html import escape
from pathlib import Path
import json
import re

class Node:
  def __init__(self, tag='', attrs=None):
    self.tag, self.attrs, self.children = tag, dict(attrs or []), []
  def has(self, cls):
    return cls in self.attrs.get('class', '').split()
  def all(self, predicate):
    result = [self] if predicate(self) else []
    for child in self.children:
      if isinstance(child, Node): result.extend(child.all(predicate))
    return result
  def text(self):
    return re.sub(r'\s+', ' ', ''.join(c.text() if isinstance(c, Node) else c for c in self.children)).strip()
  def html(self):
    allowed = {'p','strong','b','em','i','ul','ol','li','h2','h3','h4','h5','h6','table','thead','tbody','tr','td','th','br','a','sup','sub'}
    if self.tag in {'script','style','img','iframe','form'}: return ''
    inner = ''.join(c.html() if isinstance(c, Node) else escape(c) for c in self.children)
    if self.tag not in allowed: return inner
    attrs = ''
    if self.tag == 'a':
      href = self.attrs.get('href', '')
      if href.startswith(('https://','http://','mailto:')): attrs = f' href="{escape(href, quote=True)}"'
    if self.tag in {'td','th'}:
      for key in ('colspan','rowspan'):
        if self.attrs.get(key, '').isdigit(): attrs += f' {key}="{self.attrs[key]}"'
    return f'<{self.tag}{attrs}>{inner}</{self.tag}>'

class Parser(HTMLParser):
  def __init__(self, html):
    super().__init__()
    self.root = Node('root')
    self.stack = [self.root]
    self.feed(html)
  def handle_starttag(self, tag, attrs):
    node = Node(tag, attrs)
    self.stack[-1].children.append(node)
    if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}: self.stack.append(node)
  def handle_endtag(self, tag):
    for i in range(len(self.stack)-1, 0, -1):
      if self.stack[i].tag == tag:
        self.stack = self.stack[:i]
        break
  def handle_data(self, text): self.stack[-1].children.append(text)

root = Path('docs/research/figma-linked-pages/product-content')
catalog = []
for slug in ['amides','anionic-surfactants','esters','fatty-acids','fatty-alcohols','glycerine','nonionic-surfactants','phytonutrients']:
  tree = Parser((root / f'{slug}.html').read_text(encoding='utf8')).root
  listing = tree.all(lambda n: n.has('product-listing'))
  title = tree.all(lambda n: n.tag == 'h1')[0].text()
  items = []
  if listing:
    for item in listing[0].all(lambda n: n.tag == 'li'):
      names = item.all(lambda n: n.tag == 'h4')
      links = item.all(lambda n: n.tag == 'a')
      if not names or not links: continue
      name, source = names[0].text(), links[-1].attrs.get('href', '')
      brand = source.split('#')[0].rstrip('/').split('/')[-1]
      file = root / f'brand-{brand}.html'
      if not file.exists():
        items.append({'name':name, 'source':source, 'missing': True})
        continue
      detail = Parser(file.read_text(encoding='utf8')).root
      content = detail.all(lambda n: n.has('entry-content'))
      if not content: content = detail.all(lambda n: n.has('product-content'))
      if not content: content = detail.all(lambda n: n.has('content') and n.has('col-md-12'))
      if not content:
        # Life Science/Davos pages use Elementor; keep text-bearing widgets in source order.
        widgets = detail.all(lambda n: n.has('elementor-widget-text-editor'))
        intro = [n.html() for n in widgets if len(n.text()) > 70 and 'cookie' not in n.text().lower()]
        paragraphs = [n.text() for n in widgets if len(n.text()) > 70 and 'cookie' not in n.text().lower()]
        if not intro:
          main = detail.all(lambda n: n.tag=='main')
          paragraphs = [n.text() for n in (main[0] if main else detail).all(lambda n: n.tag=='p') if len(n.text())>70 and 'cookie' not in n.text().lower()]
          intro = [f'<p>{escape(p)}</p>' for p in paragraphs]
        brochures = detail.all(lambda n:n.tag=='a' and 'brochure' in n.text().lower())
        listing_images = item.all(lambda n:n.tag=='img')
        items.append({'slug':brand, 'name':name, 'source':source, 'description':paragraphs[0] if paragraphs else name, 'introHtml':''.join(intro), 'sections':[], 'brochure':brochures[0].attrs.get('href','') if brochures else '', 'images':[n.attrs.get('data-lazy-src', n.attrs.get('src','')) for n in listing_images]})
        continue
      content = content[0]
      spoilers = content.all(lambda n: n.has('su-spoiler'))
      sections = []
      for section in spoilers:
        headings = section.all(lambda n: n.has('su-spoiler-title'))
        bodies = section.all(lambda n: n.has('su-spoiler-content'))
        if headings and bodies: sections.append({'title':headings[0].text(), 'html':bodies[0].html()})
      # Intro is the content before the first accordion, excluding brochure/download widgets.
      intro = []
      for child in content.children:
        if not isinstance(child, Node): continue
        if child.has('su-accordion') or child.has('su-spoiler'): break
        if child.has('npost-content'):
          intro.extend(n.html() for n in child.children if isinstance(n, Node) and n.tag in {'p','ul','ol','table','h2','h3','h4','h5','h6'} and n.text())
        elif child.tag in {'p','ul','ol','table','h2','h3','h4','h5','h6'} and child.text(): intro.append(child.html())
      paragraphs = content.all(lambda n: n.tag == 'p' and len(n.text()) > 70)
      if not intro and paragraphs:
        # Elementor wrappers are structural; take actual body paragraphs once.
        unique = list(dict.fromkeys(n.html() for n in paragraphs))
        intro = unique[:3]
        if len(unique) > 3: sections.append({'title':'Product Information', 'html':''.join(unique[3:])})
      description = paragraphs[0].text() if paragraphs else name
      brochure_links = content.all(lambda n: n.tag == 'a' and any(word in (n.text() + n.attrs.get('href','')).lower() for word in ['brochure','leaflet','download','request']))
      images = content.all(lambda n: n.tag == 'img')
      item_data = {'slug':brand.replace('-fatty-acids','') if slug=='fatty-acids' else brand, 'name':name, 'source':source, 'description':description, 'introHtml':''.join(intro), 'sections':sections, 'brochure':brochure_links[-1].attrs.get('href','') if brochure_links else '', 'images':[n.attrs.get('src','') for n in images]}
      if brand=='davoslife-biocarotene': item_data['brochure']='https://www.klkoleo.com/davos-biocarotene-download/'
      if brand=='davoslife-e3': item_data['brochure']='https://www.klkoleo.com/davoslife-e3-download/'
      items.append(item_data)
  catalog.append({'slug':slug, 'title':title, 'products':items})
Path('src/lib/product-catalog.json').write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding='utf8')
for category in catalog:
  print(category['title'], [(p['name'], len(p.get('introHtml','')), len(p.get('sections',[])), p.get('brochure','')) for p in category['products']])

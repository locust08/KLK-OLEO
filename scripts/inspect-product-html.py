exec(open('scripts/extract-product-content.py', encoding='utf8').read().split("root = Path(")[0])
for name in ['brand-davoslife-biocarotene','brand-davoslife-e3']:
  tree = Parser(Path(f'docs/research/figma-linked-pages/product-content/{name}.html').read_text(encoding='utf8')).root
  main = tree
  print(name)
  print([(n.tag,n.attrs.get('class',''),n.text()[:350]) for n in main.all(lambda n: n.tag in {'article','h1','h2','h3','h4','p'} or n.has('su-accordion'))][-35:])
  print([(n.attrs.get('class',''),len(n.text())) for n in main.all(lambda n:n.tag=='div' and len(n.text())>500)][:15])
  print([(n.text(),n.attrs.get('href','')) for n in main.all(lambda n:n.tag=='a')][:20])

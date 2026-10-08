import fs from 'node:fs/promises';
const pages = {
  glycerin: 'https://www.klkoleo.com/lifescience/product-category/glycerin/',
  'macrogol-polyethylene-glycol-peg': 'https://www.klkoleo.com/lifescience/product-category/macrogol-polyethylene-glycol-peg/',
  'davoslife-biocarotene': 'https://klkoleo.com/davoslife/davoslife-biocarotene/',
  'davoslife-e3': 'https://klkoleo.com/davoslife/davoslife-e3/',
};
await Promise.all(Object.entries(pages).map(async ([name, url]) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${name}: ${r.status}`);
  await fs.writeFile(`docs/research/figma-linked-pages/product-content/brand-${name}.html`, await r.text());
  console.log(name, r.status);
}));

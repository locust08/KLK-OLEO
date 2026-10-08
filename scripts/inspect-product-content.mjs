import fs from 'node:fs/promises';

const root = 'docs/research/figma-linked-pages/product-content';
await fs.mkdir(root, { recursive: true });
const categories = ['amides', 'anionic-surfactants', 'esters', 'fatty-acids', 'fatty-alcohols', 'glycerine', 'nonionic-surfactants', 'phytonutrients'];
const brands = new Set();
await Promise.all(categories.map(async category => {
  const url = `https://www.klkoleo.com/products/${category}/`;
  const html = await fetch(url).then(r => { if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.text(); });
  await fs.writeFile(`${root}/${category}.html`, html);
  const listing = html.match(/<ul class="product-listing[\s\S]*?<\/ul>/)?.[0] ?? '';
  const links = [...listing.matchAll(/href="(https:\/\/www\.klkoleo\.com\/brand\/([^"/]+)\/)"/g)];
  links.forEach(match => brands.add(match[2]));
  console.log(category, links.map(match => match[2]).join(', '));
}));
await Promise.all([...brands].map(async brand => {
  const url = `https://www.klkoleo.com/brand/${brand}/`;
  const html = await fetch(url).then(r => { if (!r.ok) throw new Error(`${url}: ${r.status}`); return r.text(); });
  await fs.writeFile(`${root}/brand-${brand}.html`, html);
}));
console.log(`Saved ${brands.size} brand pages`);

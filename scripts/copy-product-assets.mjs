import fs from 'node:fs/promises';
import path from 'node:path';
const root = 'public/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images';
const extracted = 'C:/Users/imana/Downloads/klkoleo.com-full';
const catalog = JSON.parse(await fs.readFile('src/lib/product-catalog.json', 'utf8'));
await Promise.all(catalog.flatMap(category => category.products.filter(product => product.brochure && category.slug !== 'fatty-acids').map(async product => {
  const source = product.images.find(src => src.startsWith('http') || src.startsWith('/wp-content'));
  if (!source) throw new Error(`Missing image: ${product.name}`);
  const url = new URL(source, 'https://www.klkoleo.com');
  const local = path.join(extracted, decodeURIComponent(url.pathname));
  const destination = `${root}/product-${product.slug}.jpg`;
  try {
    await fs.copyFile(local, destination);
    console.log('Extracted image:', product.name);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${product.name} image: ${response.status}`);
    await fs.writeFile(destination, Buffer.from(await response.arrayBuffer()));
    console.log('Official image:', product.name);
  }
})));

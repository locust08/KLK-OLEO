import { mkdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";

const output = join(
  process.cwd(),
  "public/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images",
);

const urls = [
  "https://www.klkoleo.com/wp-content/uploads/2023/09/slide01-03.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2026/06/2026-05-26-New-Website-KLK-OLEO-Banner-Enriching-Human-Lives-Everyday.png",
  "https://www.klkoleo.com/wp-content/uploads/2025/02/KLK-OLEO-Header-Logo-1.png",
  "https://www.klkoleo.com/wp-content/uploads/2025/02/KLK-OLEO-Favicon.png",
  "https://www.klkoleo.com/wp-content/uploads/2025/02/AboutUs-01.png",
  "https://www.klkoleo.com/wp-content/uploads/2025/02/2025-RISE-Thumbnail-01.png",
  "https://www.klkoleo.com/wp-content/uploads/2021/11/bg02-01.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2023/09/Cosmetics-01.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2023/09/FnN-Image-2022.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2021/11/solutions-home-care.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2025/10/Market-Image_Life-Science.png",
  "https://www.klkoleo.com/wp-content/uploads/2021/11/Lubricant-01.png",
  "https://www.klkoleo.com/wp-content/uploads/2021/11/solutions-oleo-basics.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2021/11/solutions-polymers.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2026/01/2026-01-Global-Presence_English-1.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2024/01/The-Edge-Billion-Ringgit-Club-2023-Logo.png",
  "https://www.klkoleo.com/wp-content/uploads/2025/10/Fortune-500-Lime.png",
  "https://www.klkoleo.com/wp-content/uploads/2025/11/bestmanagedcompanies2025.png",
  "https://www.klkoleo.com/wp-content/uploads/2026/08/2026-09-VItafoods-Asia-Visual-1080px--1024x1024.png",
  "https://www.klkoleo.com/wp-content/uploads/2026/06/KLK-OLEO-in-cosmetics-Korea-1024x1024.png",
  "https://www.klkoleo.com/wp-content/uploads/2026/06/KKS-Site-100th-Anniversary-eBanner-1024x1024.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2021/11/ESG-Palm-Fruit-01.png",
  "https://www.klkoleo.com/wp-content/uploads/2025/12/About-KLK-OLEO-MKLK-scaled.jpg",
  "https://www.klkoleo.com/wp-content/uploads/2022/05/30-Years-R2-01.png",
  "https://www.klkoleo.com/wp-content/uploads/2025/01/Icons-Facilities-1.png",
  "https://www.klkoleo.com/wp-content/uploads/2021/02/rise-icon-3000-workforce.png",
  "https://www.klkoleo.com/wp-content/uploads/2020/04/icon-rise-reliable-no-border.png",
  "https://www.klkoleo.com/wp-content/uploads/2020/04/icon-rise-integrated-03.png",
  "https://www.klkoleo.com/wp-content/uploads/2020/04/icon-rise-sustainability-no-border.png",
  "https://www.klkoleo.com/wp-content/uploads/2020/04/icon-rise-efficient-supply-chain-no-border.png",
  "https://www.klkoleo.com/wp-content/uploads/fbrfg/favicon.svg",
];

await mkdir(output, { recursive: true });

for (let index = 0; index < urls.length; index += 4) {
  const batch = urls.slice(index, index + 4);
  await Promise.all(
    batch.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${response.status} ${url}`);
      }
      const cleanName = basename(new URL(url).pathname);
      await writeFile(join(output, cleanName), Buffer.from(await response.arrayBuffer()));
      process.stdout.write(`downloaded ${cleanName}\n`);
    }),
  );
}


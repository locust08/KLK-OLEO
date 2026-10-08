/* eslint-disable @typescript-eslint/no-unused-expressions -- playwright-cli evaluates this function directly. */
async (page) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const routes = ["/","/about-us","/news-events","/contact-us","/products","/products/search","/products/amides","/products/amides/palmocol-alkanolamides","/products/amides/palmowax-fatty-acid-bis-amides","/products/anionic-surfactants","/products/anionic-surfactants/palmosalt-soap-noodles","/products/anionic-surfactants/palmfonate-methyl-ester-sulphonates","/products/anionic-surfactants/sympare-methyl-ester-sulphonates","/products/anionic-surfactants/tensagex-alcohol-ether-sulphates","/products/anionic-surfactants/tensaryl-linear-alkylbenzene-sulphonates-sulphonic-acids","/products/anionic-surfactants/tensomild-sulphosuccinates","/products/anionic-surfactants/tensopol-alcohol-sulphates","/products/esters","/products/esters/edenor-triacetin","/products/esters/kosteran-sorbitan-esters","/products/esters/palmester-fatty-acid-esters","/products/esters/palmergy-biodiesels","/products/esters/palmere-methyl-esters","/products/esters/plantera-esters","/products/esters/temest-esters","/products/fatty-acids","/products/fatty-acids/palmera","/products/fatty-acids/plantera","/products/fatty-alcohols","/products/fatty-alcohols/palmerol-fatty-alcohols","/products/glycerine","/products/glycerine/glycerin","/products/glycerine/palmera-glycerine","/products/nonionic-surfactants","/products/nonionic-surfactants/greenbentin-ethoxylates-alkoxylates","/products/nonionic-surfactants/hedilub-alkoxylates-esters","/products/nonionic-surfactants/hedipin-alkoxylates-triglyceride-ethoxylates-esters","/products/nonionic-surfactants/macrogol-polyethylene-glycol-peg","/products/nonionic-surfactants/imbentin-ethoxylates-alkoxylates","/products/nonionic-surfactants/kotilen-sorbitan-ester-ethoxylates-polysorbates","/products/nonionic-surfactants/sympatens-fatty-alcohol-fatty-acid-ethoxylates-triglyceride-ethoxylates","/products/phytonutrients","/products/phytonutrients/davoslife-biocarotene","/products/phytonutrients/davoslife-e3"];
  const widths = [320, 360, 375, 390, 414, 640, 768, 900, 1024, 1041, 1280, 1440, 1920];
  const results = [];
  for (const route of routes) {
    await page.goto(`http://localhost:3001${route}`, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.setItem("klk-cookie-choice", "essential"));
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const result = await page.evaluate(() => {
        const bad = [];
        for (const el of document.querySelectorAll("main *")) {
          const box = el.getBoundingClientRect();
          if (!box.width || !box.height || el.closest('[aria-hidden="true"], .sr-only') || getComputedStyle(el).visibility === "hidden") continue;
          if (box.left >= -1 && box.right <= innerWidth + 1) continue;
          let clipped = false;
          for (let parent = el.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
            if (["hidden", "auto", "scroll", "clip"].includes(getComputedStyle(parent).overflowX)) { clipped = true; break; }
          }
          if (!clipped) bad.push({ tag: el.tagName, text: (el.textContent || "").trim().slice(0, 60), left: Math.round(box.left), right: Math.round(box.right) });
        }
        const primary = document.querySelector('nav[aria-label="Primary navigation"]');
        const header = primary?.parentElement;
        const controls = header?.lastElementChild;
        const navBox = primary?.getBoundingClientRect();
        return { rootFont: getComputedStyle(document.documentElement).fontSize, overflow: document.documentElement.scrollWidth > innerWidth + 1, outside: bad.slice(0, 8), headerOverlap: Boolean(navBox?.width && controls && navBox.right > controls.getBoundingClientRect().left + 1) };
      });
      results.push({ route, width, ...result });
    }
  }
  return { cases: results.length, failures: results.filter(r => r.overflow || r.outside.length || r.headerOverlap), scales: results.filter(r => r.route === "/").map(({width, rootFont}) => ({width, rootFont})) };
}

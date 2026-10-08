/* eslint-disable @typescript-eslint/no-unused-expressions -- playwright-cli evaluates this function directly. */
async (page) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const routes = ["/markets", "/site-directory", "/markets/beauty-personal-care", "/markets/food-nutrition", "/markets/home-care-industries-institutional-ii-cleaning", "/markets/lubricants", "/markets/polymers", "/product-enquiry", "/product-enquiry?product=PALMESTER%201100", "/news-events/archive"];
  const widths = [320, 360, 375, 390, 414, 640, 768, 900, 1024, 1041, 1280, 1440, 1920];
  const results = [];
  for (const route of routes) {
    const response = await page.goto(`http://localhost:3001${route}`, { waitUntil: "domcontentloaded" });
    const status = response.status();
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
      results.push({ route, width, status, ...result });
    }
  }
  return { cases: results.length, failures: results.filter(r => r.status !== 200 || r.overflow || r.outside.length || r.headerOverlap), scales: results.filter(r => r.route === "/").map(({width, rootFont}) => ({width, rootFont})) };
}

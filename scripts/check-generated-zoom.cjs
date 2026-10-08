/* eslint-disable @typescript-eslint/no-unused-expressions -- playwright-cli evaluates this function directly. */
async (page) => {
  const routes = ["/", "/news-events/archive", "/markets", "/markets/beauty-personal-care", "/markets/life-science", "/careers", "/history-milestones", "/sustainability", "/cookie-policy", "/privacy-notice", "/product-enquiry", "/site-directory", "/de", "/cn", "/palm-oleo-sdn-bhd", "/news-events/visit-klk-oleo-at-in-cosmetics-latin-america-2026"];
  const results = [];
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of routes) {
    await page.goto(`http://localhost:3001${route}`);
    for (const physicalWidth of [390, 768, 1280, 1920]) {
      for (const zoom of [0.8, 1, 1.25, 1.5, 2]) {
        // Desktop zoom reflows at physical width / zoom. Device pixel ratio
        // changes raster density, not CSS layout; this checks that reflow.
        const width = Math.round(physicalWidth / zoom);
        if (width < 320) continue;
        await page.setViewportSize({ width, height: Math.round(900 / zoom) });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const result = await page.evaluate(() => {
          const primary = document.querySelector('nav[aria-label="Primary navigation"]');
          const controls = primary?.parentElement?.lastElementChild;
          const navBox = primary?.getBoundingClientRect();
          const headerBox = controls?.getBoundingClientRect();
          return { overflow: document.documentElement.scrollWidth > innerWidth + 1, headerClipped: Boolean(headerBox && headerBox.right > innerWidth + 1), headerOverlap: Boolean(navBox?.width && headerBox && navBox.right > headerBox.left + 1) };
        });
        results.push({ route, physicalWidth, zoom, effectiveWidth: width, ...result });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://localhost:3001");
  await page.getByRole("button", { name: "Open navigation", exact: true }).click();
  await page.getByRole("navigation", { name: "Mobile navigation", exact: true }).waitFor({state: "visible"});
  const mobileMenu = await page.getByRole("navigation", { name: "Mobile navigation", exact: true }).evaluate(e => e.getBoundingClientRect().right <= innerWidth);
  await page.getByRole("button", { name: "Close navigation", exact: true }).click();
  await page.getByRole("button", { name: "Show Integrated principle", exact: true }).last().click();
  const mobileRise = await page.getByRole("heading", { name: "One Integrated Partner", exact: true }).last().isVisible();
  const screenshotRoot = "C:/Users/imana/OneDrive/Documents/ChatGPT/KLK-OLEO - Main/output/playwright/";
  await page.goto("http://localhost:3001/news-events");
  await page.screenshot({path: `${screenshotRoot}responsive-news-mobile.png`, fullPage: true});
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({path: `${screenshotRoot}responsive-news-desktop.png`, fullPage: true});
  return { cases: results.length, failures: results.filter(r => r.overflow || r.headerClipped || r.headerOverlap), interactions: { mobileMenu, mobileRise } };
}

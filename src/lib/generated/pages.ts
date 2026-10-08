import company from "./company.json";
import markets from "./markets.json";
import news from "./news.json";
import locales from "./locales.json";
import facilities from "./facilities.json";
import type { GeneratedPage } from "./types";

export const generatedPages: GeneratedPage[] = [...company, ...markets, ...news, ...locales, ...facilities];
export const newsArticles: GeneratedPage[] = [...news].sort((a, b) => (b.date || "").localeCompare(a.date || ""));

export function generatedPage(slug: string) {
  return generatedPages.find(page => page.slug === slug);
}

export function generatedBannerImage(page: GeneratedPage) {
  const root = "/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/images";
  const marketImages: Record<string, string> = {
    "beauty-personal-care": "beauty", "food-nutrition": "food",
    "home-care-industries-institutional-ii-cleaning": "cleaning",
    "life-science": "life-science", "lubricants": "lubricants",
    "oleo-basics": "oleo-basics", "polymers": "polymers",
  };
  const market = marketImages[page.slug.replace("markets/", "")];
  if (page.category === "Markets" && market) return `${root}/prototype-solutions-${market}.png`;
  if (page.slug.startsWith("news-events/")) return `${root}/figma-news-events-banner.png`;
  return page.image || `${root}/about-top-slider.jpg`;
}

export function localSourceLink(href: string) {
  const page = generatedPages.find(item => item.source.replace(/\/$/, "") === href.replace(/\/$/, ""));
  return page ? `/${page.slug}` : href;
}

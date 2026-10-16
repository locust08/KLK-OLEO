/** Editorial contracts shared by CMS fields, migration and fixed templates. */
export const sectionKeys = [
  "introduction",
  "capabilities",
  "innovations",
  "finder",
  "faq",
  "contact",
  "agriculture",
  "brandStory",
  "research",
  "globalPresence",
] as const;
export type SectionKey = (typeof sectionKeys)[number];
export type EditorialImage = {
  url: string;
  alt: string;
  mobileUrl?: string;
  tabletUrl?: string;
  revision?: string;
  position?: string;
  id?: number;
};
export type EditorialItem = {
  heading: string;
  body?: string;
  image?: EditorialImage;
  path?: string;
  label?: string;
  product?: number;
  category?: number;
  productPath?: string;
  categoryPath?: string;
};
export type EditorialSection = {
  enabled: boolean;
  eyebrow?: string;
  heading: string;
  body?: string;
  paragraphs?: { text: string }[];
  bullets?: { text: string }[];
  image?: EditorialImage;
  images?: { image: EditorialImage }[];
  items?: EditorialItem[];
  ctaLabel?: string;
  ctaPath?: string;
};
export type PageSections = Partial<Record<SectionKey, EditorialSection>>;
export const sectionRules: Record<
  string,
  {
    required: SectionKey[];
    optional: SectionKey[];
    counts?: Partial<Record<SectionKey, number>>;
  }
> = {
  home: {
    required: ["introduction"],
    optional: ["capabilities", "innovations", "finder", "faq", "contact"],
    counts: { capabilities: 4, innovations: 2, finder: 3 },
  },
  "about-us": {
    required: ["agriculture"],
    optional: ["brandStory", "research", "globalPresence"],
    counts: { research: 3 },
  },
  products: { required: ["introduction"], optional: [] },
  resources: { required: ["introduction"], optional: [] },
  contact: { required: ["introduction"], optional: [] },
};
export type EditorialLink = {
  label: string;
  path: string;
  newTab?: boolean | null;
};
export function safeEditorialLink(value: unknown): boolean {
  if (typeof value !== "string" || /[\u0000-\u0020\\]/.test(value))
    return false;
  if (value.startsWith("/"))
    return (
      !value.startsWith("//") &&
      /^\/(?:$|(?:about-us|products(?:\/category\/(?:functionalities|formulation-type|regulatory-labels)|\/product\/[a-z0-9-]+)?|resources|resource\/[^?#]+|contact)(?:[?#].*)?$)/.test(
        value,
      )
    );
  try {
    const u = new URL(value);
    return (
      ["https:", "mailto:", "tel:"].includes(u.protocol) &&
      !u.username &&
      !u.password &&
      (u.protocol !== "https:" || Boolean(u.hostname))
    );
  } catch {
    return false;
  }
}
export function publicationErrors(
  slug: string,
  hero: { heading?: string; image?: unknown } | undefined,
  sections: PageSections,
): string[] {
  const errors: string[] = [];
  const rule = sectionRules[slug];
  if (!rule) return ["Unsupported Agrochemical page."];
  if (!hero?.heading?.trim()) errors.push("Hero heading is required.");
  if (!hero?.image) errors.push("Hero image is required.");
  for (const key of [...rule.required, ...rule.optional]) {
    const section = sections[key];
    if (rule.required.includes(key) && !section?.enabled) {
      errors.push(`${key} is required.`);
      continue;
    }
    if (!section?.enabled) continue;
    if (!section.heading?.trim()) errors.push(`${key}: heading is required.`);
    if (
      ["introduction", "agriculture", "brandStory", "contact"].includes(key) &&
      !section.body?.trim() &&
      !section.paragraphs?.some((p) => p.text?.trim())
    )
      errors.push(`${key}: body is required.`);
    if (
      ((slug === "home" && key === "introduction") ||
        ["agriculture", "brandStory", "innovations", "contact"].includes(
          key,
        )) &&
      !section.image
    )
      errors.push(`${key}: image is required.`);
    if (key === "capabilities" && section.items?.some((item) => !item.image))
      errors.push("capabilities: every card needs an image.");
    if (
      key === "research" &&
      (section.images?.length !== 3 || section.images.some((i) => !i.image))
    )
      errors.push("research: three images are required.");
    const count = rule.counts?.[key];
    if (count && section.items?.length !== count)
      errors.push(`${key}: exactly ${count} cards are required.`);
    for (const item of section.items ?? [])
      if (!item.heading?.trim() || !item.body?.trim())
        errors.push(`${key}: each card needs a heading and body.`);
    if (key === "faq" && !section.items?.length)
      errors.push("faq: at least one question is required.");
    if (
      (section.ctaLabel || section.ctaPath) &&
      (!section.ctaLabel || !safeEditorialLink(section.ctaPath))
    )
      errors.push(`${key}: supply a label and valid CTA destination.`);
  }
  return errors;
}

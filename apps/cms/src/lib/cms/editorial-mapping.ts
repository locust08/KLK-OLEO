import type { Media } from "@/payload-types";
import {
  sectionKeys,
  type EditorialImage,
  type PageSections,
} from "../content/model";
export function editorialImage(
  value: unknown,
  preview = false,
  mobile?: unknown,
  tablet?: unknown,
): EditorialImage | undefined {
  const image = value as Media | undefined;
  if (
    !image ||
    typeof image !== "object" ||
    !image.url ||
    (!preview && !image.isPublic)
  )
    return;
  const alternative = mobile as Media | undefined;
  return {
    id: image.id,
    revision: image.updatedAt,
    tabletUrl:
      tablet &&
      typeof tablet === "object" &&
      (preview || (tablet as Media).isPublic)
        ? ((tablet as Media).url ?? undefined)
        : undefined,
    url: image.url,
    alt: image.alt,
    position: image.customCrop
      ? `${image.focalX ?? 50}% ${image.focalY ?? 50}%`
      : undefined,
    mobileUrl:
      alternative &&
      typeof alternative === "object" &&
      (preview || alternative.isPublic)
        ? (alternative.url ?? undefined)
        : undefined,
  };
}
export function mapSections(value: unknown, preview = false): PageSections {
  const result: PageSections = {};
  const content = value as Record<string, Record<string, unknown>> | undefined;
  for (const key of sectionKeys) {
    const s = content?.[key];
    if (!s) continue;
    result[key] = {
      ...s,
      enabled: s.enabled === true,
      heading: String(s.heading ?? ""),
      image: editorialImage(s.image, preview, s.mobileImage),
      images: ((s.images as { image: unknown }[]) ?? [])
        .map((i) => ({ image: editorialImage(i.image, preview)! }))
        .filter((i) => i.image),
      items: ((s.items as Record<string, unknown>[]) ?? []).map((i) => ({
        ...i,
        heading: String(i.heading ?? ""),
        productPath:
          i.product && typeof i.product === "object"
            ? `/products/product/${(i.product as { slug: string }).slug}`
            : undefined,
        categoryPath:
          i.category && typeof i.category === "object"
            ? `/products/category/functionalities?function=${(i.category as { slug: string }).slug}`
            : undefined,
        image: editorialImage(i.image, preview),
        product:
          typeof i.product === "object"
            ? (i.product as { id: number })?.id
            : i.product,
        category:
          typeof i.category === "object"
            ? (i.category as { id: number })?.id
            : i.category,
      })),
    } as PageSections[typeof key];
  }
  return result;
}

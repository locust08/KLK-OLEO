import type { Media, Resource } from "../../payload-types";
import type { ResourceViewModel } from "./view-models";

function publicMedia(value: number | Media | null | undefined): Media | undefined {
  return value && typeof value === "object" && value.isPublic ? value : undefined;
}

export function mapResource(resource: Resource): ResourceViewModel {
  const file = publicMedia(resource.file);
  const thumbnail = publicMedia(resource.thumbnail);
  const image = thumbnail?.mimeType?.startsWith("image/") ? thumbnail : undefined;
  return {
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description || undefined,
    type: resource.type,
    availability: resource.availability,
    placeholderLabel: resource.placeholderLabel || "Coming soon",
    imageUrl: image?.url || undefined,
    imageAlt: image?.alt || `${resource.title} document cover`,
    fileUrl: resource.availability === "available" ? file?.url || undefined : undefined,
  };
}

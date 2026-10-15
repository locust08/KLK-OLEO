import type { Metadata } from "next";
type Content = {
  title?: string;
  name?: string;
  heroHeading?: string;
  heroBody?: string;
  summary?: string;
  seoTitle?: string;
  seoDescription?: string;
  socialImageUrl?: string;
  canonical?: string;
  content?: { introduction?: { body?: string } };
};
export function contentMetadata(
  content: Content | null,
  path: string,
  origin: string,
): Metadata {
  if (!content)
    return {
      title: "Content unavailable",
      robots: { index: false, follow: false },
    };
  const title =
    content.seoTitle || content.heroHeading || content.name || content.title;
  const description =
    content.seoDescription ||
    content.content?.introduction?.body ||
    content.heroBody ||
    content.summary;
  const canonical = content.canonical || new URL(path, origin).href;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: content.socialImageUrl
        ? [{ url: new URL(content.socialImageUrl, origin).href }]
        : undefined,
    },
  };
}

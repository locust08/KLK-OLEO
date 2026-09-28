import "server-only";

import { getPayload, type Where } from "payload";
import config from "@payload-config";
import type {
  Banner,
  FormulationType,
  Media,
  Page,
  Product,
  ProductFunction,
  RegulatoryLabel,
  Resource,
  Site,
} from "@/payload-types";
import type {
  BannerViewModel,
  ContactFormViewModel,
  PageContentViewModel,
  ProductCategoryGroups,
  ProductViewModel,
  ResourceViewModel,
  SiteChromeViewModel,
} from "./view-models";

export const AGROCHEMICAL_SITE_SLUG = "agrochemical";

const fallbackGroups: ProductCategoryGroups = {
  functionalities: {
    label: "Functionalities",
    description:
      "Browse formulation solutions by the role they perform in the field and in the formulation.",
    options: [],
  },
  "formulation-type": {
    label: "Formulation Type",
    description: "Find products suited to the formulation system you are developing.",
    options: [],
  },
  "regulatory-labels": {
    label: "Regulatory/Labels",
    description:
      "Review solutions by the regulatory or portfolio label attached to the product.",
    options: [],
  },
};

function isMedia(value: number | Media | null | undefined): value is Media {
  return Boolean(value && typeof value === "object");
}

function relationNames<T extends { name: string }>(
  values: Array<number | T> | null | undefined,
) {
  return (values ?? [])
    .filter((value): value is T => typeof value === "object")
    .map((value) => value.name);
}

function mediaUrl(value: number | Media | null | undefined) {
  return isMedia(value) && value.isPublic && value.url ? value.url : undefined;
}

function mapProduct(product: Product): ProductViewModel {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    type: product.chemicalDescription,
    summary: product.description,
    functionalities: relationNames<ProductFunction>(product.functions),
    formulations: relationNames<FormulationType>(product.formulationTypes),
    labels: relationNames<RegulatoryLabel>(product.regulatoryLabels),
    manufacturingSite:
      product.manufacturingRegion === "EU"
        ? "Europe"
        : product.manufacturingRegion === "MY"
          ? "Malaysia"
          : "Not specified",
    casNumber: product.casNumber || "Not specified",
    imageUrl: mediaUrl(product.image),
  };
}

function mapPage(page: Page): PageContentViewModel {
  return {
    title: page.title,
    heroEyebrow: page.hero?.eyebrow || undefined,
    heroHeading: page.hero?.heading || undefined,
    heroBody: page.hero?.body || undefined,
    heroImageUrl: mediaUrl(page.hero?.image),
    sections: (page.sections ?? []).map((section) => ({
      heading: section.heading || undefined,
      body: section.body || undefined,
    })),
    seoTitle: page.seo?.title || undefined,
    seoDescription: page.seo?.description || undefined,
  };
}

async function getSite(depth = 0): Promise<Site | null> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "sites",
    where: {
      and: [
        { slug: { equals: AGROCHEMICAL_SITE_SLUG } },
        { active: { equals: true } },
      ],
    },
    depth,
    limit: 1,
    overrideAccess: false,
  });
  return result.docs[0] ?? null;
}

export async function getSiteChrome(): Promise<SiteChromeViewModel | null> {
  const site = await getSite(1);
  if (!site) return null;
  const parent = typeof site.parentSite === "object" ? site.parentSite : null;
  return {
    name: site.name,
    brandName: site.brandName || "KLK OLEO | Agrochemicals",
    contactEmail: site.contactEmail || "agrochem@klkoleo.com",
    parentDomain: parent?.domain || "https://www.klkoleo.com",
    parentLinkLabel: site.parentLinkLabel || "Part of KLK OLEO",
    navigation: (site.navigation ?? []).map(({ label, path }) => ({ label, path })),
  };
}

export async function getPageContent(slug: string) {
  const site = await getSite();
  if (!site) return null;
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    where: {
      and: [
        { site: { equals: site.id } },
        { slug: { equals: slug } },
        { _status: { equals: "published" } },
      ],
    },
    depth: 1,
    limit: 1,
    draft: false,
    overrideAccess: false,
  });
  return result.docs[0] ? mapPage(result.docs[0]) : null;
}

export async function getHomeBanner(): Promise<BannerViewModel | null> {
  const site = await getSite();
  if (!site) return null;
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "banners",
    where: {
      and: [
        { site: { equals: site.id } },
        { placement: { equals: "home.hero" } },
        { _status: { equals: "published" } },
      ],
    },
    depth: 1,
    sort: "displayOrder",
    limit: 1,
    draft: false,
    overrideAccess: false,
  });
  const banner: Banner | undefined = result.docs[0];
  return banner
    ? {
        headline: banner.headline,
        body: banner.body || undefined,
        imageUrl: mediaUrl(banner.desktopImage),
        mobileImageUrl: mediaUrl(banner.mobileImage),
        ctaLabel: banner.ctaLabel || undefined,
        ctaPath: banner.ctaPath || undefined,
      }
    : null;
}

export async function getProductCatalog() {
  const site = await getSite();
  if (!site) return { products: [], groups: fallbackGroups };
  const payload = await getPayload({ config });
  const published: Where = {
    and: [
      { site: { equals: site.id } },
      { _status: { equals: "published" } },
    ],
  };
  const [products, functions, formulations, labels] = await Promise.all([
    payload.find({
      collection: "products",
      where: published,
      depth: 1,
      limit: 200,
      sort: "name",
      draft: false,
      overrideAccess: false,
    }),
    payload.find({
      collection: "product-functions",
      where: published,
      depth: 0,
      limit: 100,
      sort: "name",
      draft: false,
      overrideAccess: false,
    }),
    payload.find({
      collection: "formulation-types",
      where: published,
      depth: 0,
      limit: 100,
      sort: "name",
      draft: false,
      overrideAccess: false,
    }),
    payload.find({
      collection: "regulatory-labels",
      where: published,
      depth: 0,
      limit: 100,
      sort: "name",
      draft: false,
      overrideAccess: false,
    }),
  ]);
  return {
    products: products.docs.map(mapProduct),
    groups: {
      functionalities: {
        ...fallbackGroups.functionalities,
        options: functions.docs.map((item) => item.name),
      },
      "formulation-type": {
        ...fallbackGroups["formulation-type"],
        options: formulations.docs.map((item) => item.name),
      },
      "regulatory-labels": {
        ...fallbackGroups["regulatory-labels"],
        options: labels.docs.map((item) => item.name),
      },
    },
  } satisfies { products: ProductViewModel[]; groups: ProductCategoryGroups };
}

export async function getProductBySlug(slug: string) {
  const site = await getSite();
  if (!site) return null;
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "products",
    where: {
      and: [
        { site: { equals: site.id } },
        { slug: { equals: slug } },
        { _status: { equals: "published" } },
      ],
    },
    depth: 1,
    limit: 1,
    draft: false,
    overrideAccess: false,
  });
  return result.docs[0] ? mapProduct(result.docs[0]) : null;
}

export async function getResources(): Promise<ResourceViewModel[]> {
  const site = await getSite();
  if (!site) return [];
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "resources",
    where: {
      and: [
        { site: { equals: site.id } },
        { _status: { equals: "published" } },
      ],
    },
    depth: 1,
    limit: 100,
    sort: "title",
    draft: false,
    overrideAccess: false,
  });
  return result.docs.map((resource: Resource) => {
    const file = isMedia(resource.file) && resource.file.isPublic ? resource.file : null;
    return {
      id: resource.id,
      slug: resource.slug,
      title: resource.title,
      description: resource.description || undefined,
      type: resource.type,
      availability: resource.availability,
      placeholderLabel: resource.placeholderLabel || "Coming soon",
      imageUrl: file?.mimeType?.startsWith("image/") ? file.url || undefined : undefined,
      fileUrl: resource.availability === "available" ? file?.url || undefined : undefined,
    };
  });
}

export async function getContactForm(
  slug = "general-enquiry",
): Promise<ContactFormViewModel | null> {
  const site = await getSite();
  if (!site) return null;
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "forms",
    where: {
      and: [
        { site: { equals: site.id } },
        { slug: { equals: slug } },
        { _status: { equals: "published" } },
      ],
    },
    depth: 0,
    limit: 1,
    draft: false,
    overrideAccess: false,
  });
  const form = result.docs[0];
  return form
    ? {
        slug: form.slug,
        consentLabel: form.consentLabel,
        successMessage: form.successMessage || "Thank you. Your enquiry has been received.",
      }
    : null;
}

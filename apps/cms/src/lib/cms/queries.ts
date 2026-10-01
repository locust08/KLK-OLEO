import "server-only";
import { mapResource } from "./resource-view-model";
import sourceProducts from "../../../data/agrochemical-products.json";
import sourceTaxonomies from "../../../data/agrochemical-taxonomies.json";

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
import { AGROCHEMICAL_BRAND_NAME } from "./view-models";

export const AGROCHEMICAL_SITE_SLUG = "agrochemical";

const fallbackResources: ResourceViewModel[] = [
  {
    id: -1,
    slug: "agrochemicals-brochure",
    title: "Agrochemicals Brochure",
    type: "brochure",
    availability: "available",
    placeholderLabel: "Request",
  },
  {
    id: -2,
    slug: "abim-2025-leaflet",
    title: "ABIM 2025 Leaflet",
    type: "leaflet",
    availability: "available",
    placeholderLabel: "Request",
  },
  {
    id: -3,
    slug: "abim-2025-poster",
    title: "ABIM 2025 Poster",
    type: "poster",
    availability: "available",
    placeholderLabel: "Request",
  },
  {
    id: -4,
    slug: "aidigro-pn123-leaflet",
    title: "Aidigro PN123 Leaflet",
    type: "leaflet",
    availability: "available",
    placeholderLabel: "Request",
  },
  {
    id: -5,
    slug: "aidigro-sv-leaflet",
    title: "Aidigro SV Leaflet",
    type: "leaflet",
    availability: "available",
    placeholderLabel: "Request",
  },
];

const fallbackContactForm: ContactFormViewModel = {
  slug: "general-enquiry",
  consentLabel:
    "I agree that KLK OLEO may use my submitted details to respond to this enquiry.",
  successMessage: "Thank you. Your enquiry has been received.",
};

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

type SourceProduct = {
  name: string;
  slug: string;
  chemicalDescription: string;
  description: string;
  functions: string[];
  formulationTypes: string[];
  regulatoryLabels: string[];
  manufacturingRegion?: string;
  casNumber?: string;
};

function sourceSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function mapSourceProduct(product: SourceProduct, index: number): ProductViewModel {
  return {
    id: -(index + 1),
    slug: product.slug,
    name: product.name,
    type: product.chemicalDescription,
    summary: product.description,
    functionalities: product.functions,
    functionalitySlugs: product.functions.map(sourceSlug),
    formulations: product.formulationTypes,
    formulationSlugs: product.formulationTypes.map(sourceSlug),
    labels: product.regulatoryLabels,
    labelSlugs: product.regulatoryLabels.map(sourceSlug),
    manufacturingSite:
      product.manufacturingRegion === "EU"
        ? "Europe"
        : product.manufacturingRegion === "MY"
          ? "Malaysia"
          : "Not specified",
    casNumber: product.casNumber || "Not specified",
  };
}

function getLocalSourceCatalog() {
  const products = (sourceProducts as SourceProduct[]).map(mapSourceProduct);
  const options = (names: string[]) => names.map((name) => ({ id: sourceSlug(name), slug: sourceSlug(name), name }));
  return {
    products,
    groups: {
      functionalities: { ...fallbackGroups.functionalities, options: options(sourceTaxonomies.functions) },
      "formulation-type": { ...fallbackGroups["formulation-type"], options: options(sourceTaxonomies.formulationTypes) },
      "regulatory-labels": { ...fallbackGroups["regulatory-labels"], options: options(sourceTaxonomies.regulatoryLabels) },
    },
  } satisfies { products: ProductViewModel[]; groups: ProductCategoryGroups };
}

function isMedia(value: number | Media | null | undefined): value is Media {
  return Boolean(value && typeof value === "object");
}

function relationValues<T extends { name: string; slug: string }>(
  values: Array<number | T> | null | undefined,
) {
  return (values ?? [])
    .filter((value): value is T => typeof value === "object")
    .map((value) => ({ name: value.name, slug: value.slug }));
}

function mediaUrl(value: number | Media | null | undefined) {
  return isMedia(value) && value.isPublic && value.url ? value.url : undefined;
}

function mapProduct(product: Product): ProductViewModel {
  const functions = relationValues<ProductFunction>(product.functions);
  const formulations = relationValues<FormulationType>(product.formulationTypes);
  const labels = relationValues<RegulatoryLabel>(product.regulatoryLabels);
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    type: product.chemicalDescription,
    summary: product.description,
    functionalities: functions.map((item) => item.name),
    functionalitySlugs: functions.map((item) => item.slug),
    formulations: formulations.map((item) => item.name),
    formulationSlugs: formulations.map((item) => item.slug),
    labels: labels.map((item) => item.name),
    labelSlugs: labels.map((item) => item.slug),
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
    brandName: AGROCHEMICAL_BRAND_NAME,
    contactEmail: site.contactEmail || "agrochem@klkoleo.com",
    parentDomain: parent?.domain || "https://www.klkoleo.com",
    parentLinkLabel: site.parentLinkLabel || "Part of KLK OLEO",
    navigation: (site.navigation ?? [])
      .filter(({ path }) => path !== "/")
      .map(({ label, path }) => ({ label, path })),
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
  if (!site) {
    return process.env.NODE_ENV !== "production"
      ? getLocalSourceCatalog()
      : { products: [], groups: fallbackGroups };
  }
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
  const catalog = {
    products: products.docs.map(mapProduct),
    groups: {
      functionalities: {
        ...fallbackGroups.functionalities,
        options: functions.docs.map((item) => ({ id: item.id, slug: item.slug, name: item.name })),
      },
      "formulation-type": {
        ...fallbackGroups["formulation-type"],
        options: formulations.docs.map((item) => ({ id: item.id, slug: item.slug, name: item.name })),
      },
      "regulatory-labels": {
        ...fallbackGroups["regulatory-labels"],
        options: labels.docs.map((item) => ({ id: item.id, slug: item.slug, name: item.name })),
      },
    },
  } satisfies { products: ProductViewModel[]; groups: ProductCategoryGroups };
  return catalog.products.length === 0 && process.env.NODE_ENV !== "production"
    ? getLocalSourceCatalog()
    : catalog;
}

export async function getProductBySlug(slug: string) {
  const site = await getSite();
  if (!site) {
    return process.env.NODE_ENV !== "production"
      ? getLocalSourceCatalog().products.find((product) => product.slug === slug) ?? null
      : null;
  }
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
  if (result.docs[0]) return mapProduct(result.docs[0]);
  if (process.env.NODE_ENV !== "production") {
    return getLocalSourceCatalog().products.find((product) => product.slug === slug) ?? null;
  }
  return null;
}

export async function getResources(): Promise<ResourceViewModel[]> {
  const site = await getSite();
  if (!site) return fallbackResources;
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
  const resources = result.docs.map(mapResource);
  return resources.length > 0 ? resources : fallbackResources;
}

export async function getContactForm(
  slug = "general-enquiry",
): Promise<ContactFormViewModel | null> {
  const site = await getSite();
  if (!site) return fallbackContactForm;
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
    : fallbackContactForm;
}

import { editorialReadContext } from "./preview";
import { editorialImage, mapSections } from "./editorial-mapping";
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
    description:
      "Find products suited to the formulation system you are developing.",
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
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mapSourceProduct(
  product: SourceProduct,
  index: number,
): ProductViewModel {
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
  const options = (names: string[]) =>
    names.map((name) => ({
      id: sourceSlug(name),
      slug: sourceSlug(name),
      name,
    }));
  return {
    products,
    groups: {
      functionalities: {
        ...fallbackGroups.functionalities,
        options: options(sourceTaxonomies.functions),
      },
      "formulation-type": {
        ...fallbackGroups["formulation-type"],
        options: options(sourceTaxonomies.formulationTypes),
      },
      "regulatory-labels": {
        ...fallbackGroups["regulatory-labels"],
        options: options(sourceTaxonomies.regulatoryLabels),
      },
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

export function mapProduct(
  product: Product,
  preview = false,
): ProductViewModel {
  const functions = relationValues<ProductFunction>(product.functions);
  const formulations = relationValues<FormulationType>(
    product.formulationTypes,
  );
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
    imageUrl: editorialImage(product.image, preview)?.url,
    imageAlt: editorialImage(product.image, preview)?.alt,
    image: editorialImage(product.image, preview),
    pdfImageUrl:
      typeof product.image === "object" && product.image
        ? /^image\/(png|jpeg)$/.test(product.image.mimeType ?? "")
          ? editorialImage(product.image, preview)?.url
          : editorialImage(product.image.pdfVariant, preview)?.url
        : undefined,
    seoTitle: product.seo?.title ?? undefined,
    seoDescription: product.seo?.description ?? undefined,
    socialImageUrl: mediaUrl(product.seo?.socialImage),
    canonical: product.seo?.canonical ?? undefined,
    updatedAt: product.updatedAt,
    brochureEnabled: product.brochureEnabled !== false,
    resources: (product.resources ?? [])
      .filter(
        (r): r is Exclude<typeof r, number> =>
          typeof r === "object" && r !== null,
      )
      .map((r) => ({ id: r.id, title: r.title, slug: r.slug })),
  };
}

function mapPage(page: Page, preview = false): PageContentViewModel {
  return {
    title: page.title,
    content: mapSections(page.content, preview),
    heroImage: editorialImage(
      page.hero?.image,
      preview,
      page.hero?.mobileImage,
      page.hero?.tabletImage,
    ),
    socialImageUrl: mediaUrl(page.seo?.socialImage),
    canonical: page.seo?.canonical ?? undefined,
    heroEyebrow: page.hero?.eyebrow || undefined,
    heroHeading: page.hero?.heading || undefined,
    heroBody: page.hero?.body || undefined,
    heroImageUrl: editorialImage(page.hero?.image, preview)?.url,
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

export async function getSiteChrome(
  options: { publishedOnly?: boolean } = {},
): Promise<SiteChromeViewModel | null> {
  const site = await getSite(1);
  if (!site) return null;
  const parent = typeof site.parentSite === "object" ? site.parentSite : null;
  const context = await editorialReadContext(site.id);
  const { payload } = context;
  const draft = options.publishedOnly ? false : context.draft;
  const user = options.publishedOnly ? undefined : context.user;
  const result = await payload.find({
    collection: "site-presentation",
    where: {
      and: [
        { site: { equals: site.id } },
        ...(!draft ? [{ _status: { equals: "published" } }] : []),
      ],
    },
    limit: 1,
    depth: 1,
    draft,
    user,
    overrideAccess: false,
  });
  const presentation = result.docs[0];
  if (!presentation) return null;
  return {
    name: site.name,
    draftPreview: draft,
    contactBanner: (await getPageContent("home", options))?.content.contact,
    brandName: presentation.brandName,
    contactEmail: presentation.contactEmail,
    parentDomain: parent?.domain || "",
    parentLinkLabel: site.parentLinkLabel || "",
    navigation: presentation.navigation ?? [],
    copy: Object.fromEntries(
      (presentation.copy ?? []).map((c) => [c.key, c.text]),
    ),
    footer: {
      ...presentation.footer,
      description: presentation.footer?.description ?? "",
      logo: editorialImage(presentation.footer?.logo, draft),
      quickLinks: presentation.footer?.quickLinks ?? [],
      productLinks: presentation.footer?.productLinks ?? [],
      legalLinks: presentation.footer?.legalLinks ?? [],
    },
  };
}

export async function getPageContent(
  slug: string,
  options: { publishedOnly?: boolean } = {},
) {
  const site = await getSite();
  if (!site) return null;
  const context = await editorialReadContext(site.id);
  const { payload } = context;
  const draft = options.publishedOnly ? false : context.draft;
  const user = options.publishedOnly ? undefined : context.user;
  const result = await payload.find({
    collection: "pages",
    where: {
      and: [
        { site: { equals: site.id } },
        { slug: { equals: slug } },
        ...(!draft ? [{ _status: { equals: "published" } }] : []),
      ],
    },
    depth: 3,
    limit: 1,
    draft,
    user,
    overrideAccess: false,
  });
  return result.docs[0] ? mapPage(result.docs[0], draft) : null;
}

export async function getHomeBanner(): Promise<BannerViewModel | null> {
  const site = await getSite();
  if (!site) return null;
  const { payload, draft, user } = await editorialReadContext(site.id);
  const result = await payload.find({
    collection: "banners",
    where: {
      and: [
        { site: { equals: site.id } },
        { placement: { equals: "home.hero" } },
        ...(!draft ? [{ _status: { equals: "published" } }] : []),
      ],
    },
    depth: 1,
    sort: "displayOrder",
    limit: 1,
    draft,
    user,
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
  const { payload, draft, user } = await editorialReadContext(site.id);
  const published: Where = {
    and: [
      { site: { equals: site.id } },
      ...(!draft ? [{ _status: { equals: "published" } }] : []),
    ],
  };
  const [products, functions, formulations, labels] = await Promise.all([
    payload.find({
      collection: "products",
      where: published,
      depth: 1,
      pagination: false,
      sort: "name",
      draft,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: "product-functions",
      where: published,
      depth: 0,
      pagination: false,
      sort: "name",
      draft,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: "formulation-types",
      where: published,
      depth: 0,
      pagination: false,
      sort: "name",
      draft,
      user,
      overrideAccess: false,
    }),
    payload.find({
      collection: "regulatory-labels",
      where: published,
      depth: 0,
      pagination: false,
      sort: "name",
      draft,
      user,
      overrideAccess: false,
    }),
  ]);
  const presentation = await payload.find({
    collection: "site-presentation",
    where: { site: { equals: site.id } },
    draft,
    user,
    overrideAccess: false,
    limit: 1,
    depth: 0,
  });
  const configured = presentation.docs[0]?.catalogue;
  const catalog = {
    products: products.docs.map((product) => mapProduct(product, draft)),
    groups: {
      functionalities: {
        ...fallbackGroups.functionalities,
        label: configured?.functionalities?.label ?? "",
        description: configured?.functionalities?.description ?? "",
        showDescription: configured?.functionalities?.showDescription === true,
        options: functions.docs.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description ?? undefined,
        })),
      },
      "formulation-type": {
        ...fallbackGroups["formulation-type"],
        label: configured?.formulation_type?.label ?? "",
        description: configured?.formulation_type?.description ?? "",
        showDescription: configured?.formulation_type?.showDescription === true,
        options: formulations.docs.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description ?? undefined,
        })),
      },
      "regulatory-labels": {
        ...fallbackGroups["regulatory-labels"],
        label: configured?.regulatory_labels?.label ?? "",
        description: configured?.regulatory_labels?.description ?? "",
        showDescription:
          configured?.regulatory_labels?.showDescription === true,
        options: labels.docs.map((item) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          description: item.description ?? undefined,
        })),
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
      ? (getLocalSourceCatalog().products.find(
          (product) => product.slug === slug,
        ) ?? null)
      : null;
  }
  const { payload, draft, user } = await editorialReadContext(site.id);
  const result = await payload.find({
    collection: "products",
    where: {
      and: [
        { site: { equals: site.id } },
        { slug: { equals: slug } },
        ...(!draft ? [{ _status: { equals: "published" } }] : []),
      ],
    },
    depth: 3,
    limit: 1,
    draft,
    user,
    overrideAccess: false,
  });
  if (result.docs[0]) return mapProduct(result.docs[0], draft);
  if (process.env.NODE_ENV !== "production") {
    return (
      getLocalSourceCatalog().products.find(
        (product) => product.slug === slug,
      ) ?? null
    );
  }
  return null;
}

export async function getResources(): Promise<ResourceViewModel[]> {
  const site = await getSite();
  if (!site) return [];
  const { payload, draft, user } = await editorialReadContext(site.id);
  const result = await payload.find({
    collection: "resources",
    where: {
      and: [
        { site: { equals: site.id } },
        ...(!draft ? [{ _status: { equals: "published" } }] : []),
      ],
    },
    depth: 1,
    pagination: false,
    sort: "title",
    draft,
    user,
    overrideAccess: false,
  });
  const resources = result.docs.map((resource) => {
    const mapped = mapResource(resource);
    // Method 2: never serialize PDF URLs into the Resources page/client props.
    delete mapped.fileUrl;
    return mapped;
  });
  return resources;
}

export async function getContactForm(
  slug = "general-enquiry",
  allowFallback = true,
): Promise<ContactFormViewModel | null> {
  const site = await getSite();
  if (!site) return null;
  const { payload, draft, user } = await editorialReadContext(site.id);
  const result = await payload.find({
    collection: "forms",
    where: {
      and: [
        { site: { equals: site.id } },
        { slug: { equals: slug } },
        ...(!draft ? [{ _status: { equals: "published" } }] : []),
      ],
    },
    depth: 0,
    limit: 1,
    draft,
    user,
    overrideAccess: false,
  });
  const form = result.docs[0];
  return form
    ? {
        slug: form.slug,
        consentLabel: form.consentLabel,
        successMessage:
          form.successMessage || "Thank you. Your enquiry has been received.",
      }
    : null;
}

export async function getRedirectProduct(slug: string) {
  const site = await getSite();
  if (!site) return null;
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "product-redirects",
    where: {
      and: [{ site: { equals: site.id } }, { fromSlug: { equals: slug } }],
    },
    limit: 1,
    depth: 0,
    overrideAccess: false,
  });
  const ref = result.docs[0];
  if (!ref) return null;
  const id = typeof ref.product === "object" ? ref.product.id : ref.product;
  const product = await payload.find({
    collection: "products",
    where: {
      and: [
        { id: { equals: id } },
        { site: { equals: site.id } },
        { _status: { equals: "published" } },
      ],
    },
    limit: 1,
    depth: 0,
    draft: false,
    overrideAccess: false,
  });
  return product.docs[0]?.slug ?? null;
}

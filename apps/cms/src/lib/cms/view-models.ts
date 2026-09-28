export const productCategoryKeys = [
  "functionalities",
  "formulation-type",
  "regulatory-labels",
] as const;

export type ProductCategoryKey = (typeof productCategoryKeys)[number];

export type ProductViewModel = {
  id: number;
  slug: string;
  name: string;
  type: string;
  summary: string;
  functionalities: string[];
  functionalitySlugs: string[];
  formulations: string[];
  formulationSlugs: string[];
  labels: string[];
  labelSlugs: string[];
  manufacturingSite: string;
  casNumber: string;
  imageUrl?: string;
};

export type ProductCategoryOption = {
  id: number | string;
  slug: string;
  name: string;
};

export type ProductCategoryGroup = {
  label: string;
  description: string;
  options: ProductCategoryOption[];
};

export type ProductCategoryGroups = Record<ProductCategoryKey, ProductCategoryGroup>;

export type PageContentViewModel = {
  title: string;
  heroEyebrow?: string;
  heroHeading?: string;
  heroBody?: string;
  heroImageUrl?: string;
  sections: Array<{ heading?: string; body?: string }>;
  seoTitle?: string;
  seoDescription?: string;
};

export type BannerViewModel = {
  headline: string;
  body?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  ctaLabel?: string;
  ctaPath?: string;
};

export type ResourceViewModel = {
  id: number;
  slug: string;
  title: string;
  description?: string;
  type: string;
  availability: "placeholder" | "available";
  placeholderLabel: string;
  imageUrl?: string;
  fileUrl?: string;
};

export type ContactFormViewModel = {
  slug: string;
  consentLabel: string;
  successMessage: string;
};

export type SiteChromeViewModel = {
  name: string;
  brandName: string;
  contactEmail: string;
  parentDomain: string;
  parentLinkLabel: string;
  navigation: Array<{ label: string; path: string }>;
};

export function isProductCategoryKey(value: string): value is ProductCategoryKey {
  return productCategoryKeys.includes(value as ProductCategoryKey);
}

export function getProductCategoryValues(
  product: ProductViewModel,
  key: ProductCategoryKey,
) {
  if (key === "functionalities") return product.functionalitySlugs;
  if (key === "formulation-type") return product.formulationSlugs;
  return product.labelSlugs;
}

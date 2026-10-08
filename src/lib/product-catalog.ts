import catalog from "./product-catalog.json";

export interface ProductFamily {
  slug: string;
  name: string;
  source: string;
  description: string;
  introHtml: string;
  sections: Array<{ title: string; html: string }>;
  brochure: string;
  images: string[];
}

export interface ProductCategory {
  slug: string;
  title: string;
  products: ProductFamily[];
}

export const productCategories: ProductCategory[] = catalog;
export function getProductCategory(slug: string) {
  return productCategories.find(category => category.slug === slug);
}
export function productFamilyHref(category: ProductCategory, product: ProductFamily) {
  return `/products/${category.slug}/${product.slug}`;
}
export function productListingDescription(product: ProductFamily) {
  if (product.slug === "palmera") return "PALMERA Fatty Acids are our range of renewable products derived from vegetable oils through classical oleochemical processes such as distillation and fractionation, including derivatives like dimer, monomer, trimer and isostearic acids.";
  if (product.slug === "plantera") return "PLANTERA Fatty Acids use feedstocks outside the scope of EUDR (EU Deforestation Regulation), prioritising local sourcing and short supply routes.";
  return product.description;
}

import type { Metadata } from "next";
import { EnquiryForm } from "@/components/generated/EnquiryForm";
import { PrototypePageShell, PrototypePageBanner, prototypeImageRoot } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";

export const metadata: Metadata = { title: "Product Enquiry | KLK OLEO" };

export default async function ProductEnquiryPage({ searchParams }: { searchParams: Promise<{ product?: string | string[] }> }) {
  const product = (await searchParams).product;
  const requestedProduct = typeof product === "string" ? product.slice(0, 200) : "";
  return <PrototypePageShell><PrototypePageBanner title="Product Enquiry" image={`${prototypeImageRoot}/prototype-solutions-beauty.png`} breadcrumbs={[{ label: "Contact Us", href: "/contact-us" }, { label: "Product Enquiry" }]} /><EnquiryForm requestedProduct={requestedProduct} /></PrototypePageShell>;
}

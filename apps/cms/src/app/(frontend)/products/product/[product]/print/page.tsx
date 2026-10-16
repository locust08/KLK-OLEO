import {notFound} from "next/navigation";
import {ProductDetailPage} from "@/components/products/ProductDetailPage";
import {publishedPdfSource} from "@/lib/product-pdf/published";
import {draftPdfSource} from "@/lib/product-pdf/presentation";
export const dynamic="force-dynamic";
export const metadata={robots:{index:false,follow:false}};
export default async function PrintPage({params,searchParams}:{params:Promise<{product:string}>;searchParams:Promise<{draft?:string}>}){const slug=(await params).product;const draft=(await searchParams).draft==="1";const snapshot=draft?await draftPdfSource(slug):await publishedPdfSource(slug);if(!snapshot)notFound();return <div data-pdf-version={snapshot.version}><ProductDetailPage product={snapshot.product} copy={snapshot.copy} contactBanner={snapshot.contactBanner} version={snapshot.version} draft={snapshot.draft} printOnly/></div>;}

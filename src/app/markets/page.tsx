import type { Metadata } from "next";
import { PageDirectory } from "@/components/generated/PageDirectory";
import { PrototypePageShell, PrototypePageBanner, prototypeImageRoot } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";

export const metadata: Metadata = { title: "Markets & Applications | KLK OLEO" };
export default function MarketsPage() {
  return <PrototypePageShell><PrototypePageBanner title="Markets & Applications" image={`${prototypeImageRoot}/prototype-solutions-beauty.png`} breadcrumbs={[{ label: "Markets" }]} /><PageDirectory marketsOnly /></PrototypePageShell>;
}

import type { Metadata } from "next";
import { PageDirectory } from "@/components/generated/PageDirectory";
import { PrototypePageShell, PrototypePageBanner, prototypeImageRoot } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";

export const metadata: Metadata = { title: "Site Directory | KLK OLEO" };
export default function DirectoryPage() {
  return <PrototypePageShell><PrototypePageBanner title="Explore KLK OLEO" image={`${prototypeImageRoot}/figma-news-events-banner.png`} breadcrumbs={[{ label: "Site Directory" }]} /><PageDirectory /></PrototypePageShell>;
}

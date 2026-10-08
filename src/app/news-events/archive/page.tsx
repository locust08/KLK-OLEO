import type { Metadata } from "next";
import { NewsArchive } from "@/components/generated/NewsArchive";
import { newsArticles } from "@/lib/generated/pages";
import { PrototypePageShell, PrototypePageBanner, prototypeImageRoot } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";

export const metadata: Metadata = { title: "News Archive | KLK OLEO" };

export default function ArchivePage() {
  return <PrototypePageShell><PrototypePageBanner title="News & Events Archive" image={`${prototypeImageRoot}/figma-news-events-banner.png`} breadcrumbs={[{ label: "News & Events", href: "/news-events" }, { label: "Archive" }]} /><NewsArchive articles={newsArticles} /></PrototypePageShell>;
}

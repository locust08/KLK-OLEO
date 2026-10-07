import { AboutPage } from "@/components/about/AboutPage";
import { getPageContent } from "@/lib/cms/queries";
import { getMapPoints } from "@/lib/maps/query";

export default async function Page() {
  const [page, mapPoints] = await Promise.all([getPageContent("about-us"), getMapPoints()]);
  return <AboutPage page={page} mapPoints={mapPoints} />;
}

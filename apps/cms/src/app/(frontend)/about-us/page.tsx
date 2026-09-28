import { AboutPage } from "@/components/about/AboutPage";
import { getPageContent } from "@/lib/cms/queries";

export default async function Page() {
  const page = await getPageContent("about-us");
  return <AboutPage page={page} />;
}

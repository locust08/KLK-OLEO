import { HomePage } from "@/components/home/HomePage";
import { getHomeBanner, getPageContent } from "@/lib/cms/queries";

export default async function Page() {
  const [page, banner] = await Promise.all([
    getPageContent("home"),
    getHomeBanner(),
  ]);
  return <HomePage page={page} banner={banner} />;
}

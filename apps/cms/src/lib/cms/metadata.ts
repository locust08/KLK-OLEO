import { getPageContent } from "./queries";
import { contentMetadata } from "../content/seo";
export async function pageMetadata(slug: string, path: string) {
  return contentMetadata(
    await getPageContent(slug),
    path,
    process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  );
}

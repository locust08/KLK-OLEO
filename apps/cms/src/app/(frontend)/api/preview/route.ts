import { draftMode } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { siteIds } from "@/access";
import { safeEditorialLink } from "@/lib/content/model";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const path = url.searchParams.get("path") || "/";
  if (url.searchParams.has("exit")) {
    (await draftMode()).disable();
    return Response.redirect(new URL("/", url), 303);
  }
  if (!path.startsWith("/") || !safeEditorialLink(path))
    return new Response("Invalid preview path", { status: 400 });
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });
  if (
    !user ||
    !["super-admin", "site-admin", "editor", "publisher", "viewer"].includes(
      user.role,
    )
  )
    return new Response("Sign in to the CMS to preview.", { status: 403 });
  const site = await payload.find({
    collection: "sites",
    where: { slug: { equals: "agrochemical" } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  if (
    !site.docs[0] ||
    (user.role !== "super-admin" &&
      !siteIds(user).some((id) => String(id) === String(site.docs[0].id)))
  )
    return new Response("Site access denied", { status: 403 });
  (await draftMode()).enable();
  return Response.redirect(new URL(path, url), 303);
}

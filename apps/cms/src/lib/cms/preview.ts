import "server-only";
import { draftMode, headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { siteIds, type ScopedUser } from "../../access";
export async function editorialReadContext(siteId?: number | string) {
  const payload = await getPayload({ config });
  if (!(await draftMode()).isEnabled)
    return { payload, draft: false as boolean, user: undefined };
  const { user } = await payload.auth({ headers: await headers() });
  if (
    !user ||
    !["super-admin", "site-admin", "editor", "publisher", "viewer"].includes(
      user.role,
    )
  )
    return { payload, draft: false, user: undefined };
  if (siteId === undefined) {
    const result = await payload.find({
      collection: "sites",
      where: { slug: { equals: "agrochemical" } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    siteId = result.docs[0]?.id;
    if (siteId === undefined) return { payload, draft: false, user: undefined };
  }
  if (
    siteId !== undefined &&
    user.role !== "super-admin" &&
    !siteIds(user as ScopedUser).some((id) => String(id) === String(siteId))
  )
    return { payload, draft: false, user: undefined };
  return { payload, draft: true, user };
}

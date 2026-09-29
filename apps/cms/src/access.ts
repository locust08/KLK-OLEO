import {
  APIError,
  type Access,
  type CollectionBeforeChangeHook,
  type FieldAccess,
  type Where,
} from "payload";

export const roles = [
  "super-admin",
  "site-admin",
  "editor",
  "publisher",
  "lead-manager",
  "viewer",
] as const;
export type Role = (typeof roles)[number];
export type ScopedUser = {
  id: string | number;
  role: Role;
  sites?: Array<string | number | { id: string | number }> | null;
};

export const idOf = (value: unknown): string | number | undefined => {
  if (typeof value === "string" || typeof value === "number") return value;
  if (value && typeof value === "object" && "id" in value)
    return idOf(value.id);
};
export const siteIds = (user: ScopedUser | null | undefined) =>
  (user?.sites ?? [])
    .map(idOf)
    .filter((id): id is string | number => id !== undefined);
export const hasRole = (
  user: ScopedUser | null | undefined,
  allowed: readonly Role[],
) => Boolean(user && allowed.includes(user.role));
export const superAdmin: Access = ({ req }) =>
  hasRole(req.user as ScopedUser | null, ["super-admin"]);
export const superAdminField: FieldAccess = ({ req }) =>
  hasRole(req.user as ScopedUser | null, ["super-admin"]);
export const publisherField: FieldAccess = ({ req }) =>
  hasRole(req.user as ScopedUser | null, [
    "super-admin",
    "site-admin",
    "publisher",
  ]);

export function scopedAccess(
  user: ScopedUser | null | undefined,
  operation: "read" | "write" | "delete" | "leads",
  publicRead = false,
): boolean | Where {
  if (user?.role === "super-admin") return true;
  if (!user)
    return operation === "read" && publicRead
      ? { _status: { equals: "published" } }
      : false;
  const allowed: Role[] =
    operation === "write"
      ? ["site-admin", "editor", "publisher"]
      : operation === "delete"
        ? ["site-admin"]
        : operation === "leads"
          ? ["site-admin", "lead-manager"]
          : [...roles];
  if (!allowed.includes(user.role) || !siteIds(user).length) return false;
  return { site: { in: siteIds(user) } };
}
export const contentRead: Access = ({ req }) =>
  scopedAccess(req.user as ScopedUser | null, "read", true);
export const contentWrite: Access = ({ req }) =>
  scopedAccess(req.user as ScopedUser | null, "write");
export const contentDelete: Access = ({ req }) =>
  scopedAccess(req.user as ScopedUser | null, "delete");
export const internalRead: Access = ({ req }) =>
  scopedAccess(req.user as ScopedUser | null, "read");
export const leadRead: Access = ({ req }) =>
  scopedAccess(req.user as ScopedUser | null, "leads");

// Create access cannot express a document query: validate incoming site explicitly.
export const scopedCreate: Access = ({ req, data }) => {
  const user = req.user as ScopedUser | null;
  if (!hasRole(user, ["super-admin", "site-admin", "editor", "publisher"]))
    return false;
  if (user?.role === "super-admin") return true;
  return siteIds(user).some((id) => String(id) === String(idOf(data?.site)));
};
export const enforceScope: CollectionBeforeChangeHook = async ({
  req,
  data,
  originalDoc,
  operation,
}) => {
  const user = req.user as ScopedUser | null;
  if (!user) return data; // Trusted Local API seed; collection access rejects unauthenticated writes.
  if (user.role !== "super-admin") {
    const incoming = idOf(data.site ?? originalDoc?.site);
    if (!siteIds(user).some((id) => String(id) === String(incoming)))
      throw new APIError("Site is outside your assigned scope.", 403);
    if (
      operation === "update" &&
      incoming !== undefined &&
      String(incoming) !== String(idOf(originalDoc?.site))
    )
      throw new APIError(
        "Only a super admin can move records between sites.",
        403,
      );
    if (
      !hasRole(user, ["site-admin", "publisher"]) &&
      (data._status ?? originalDoc?._status) === "published"
    )
      throw new APIError(
        "Editors must save a draft; publishing requires publisher permissions.",
        403,
      );
  }
  return data;
};

export const checkRelatedSites: CollectionBeforeChangeHook = async ({
  req,
  data,
  originalDoc,
  collection,
}) => {
  const site = idOf(data.site ?? originalDoc?.site);
  const relationFields: Record<string, string> =
    collection.slug === "products"
      ? {
          functions: "product-functions",
          formulationTypes: "formulation-types",
          regulatoryLabels: "regulatory-labels",
          resources: "resources",
          image: "media",
        }
      : collection.slug === "forms"
        ? { routingProfile: "routing-profiles" }
        : collection.slug === "resources"
          ? { file: "media", thumbnail: "media" }
          : collection.slug === "banners"
            ? { desktopImage: "media", mobileImage: "media" }
            : {};
  for (const [field, target] of Object.entries(relationFields)) {
    const value = data[field];
    if (value === undefined || value === null) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      const id = idOf(item);
      if (id === undefined) continue;
      const related = (await req.payload.findByID({
        collection: target as "products",
        id,
        depth: 0,
        req,
        overrideAccess: true,
      })) as unknown as { site: unknown };
      if (String(idOf(related.site)) !== String(site))
        throw new APIError(`${field} must belong to the same site.`, 400);
    }
  }
  if (collection.slug === "pages" && data.hero?.image) {
    const media = (await req.payload.findByID({
      collection: "media",
      id: idOf(data.hero.image)!,
      depth: 0,
      req,
      overrideAccess: true,
    })) as unknown as { site: unknown };
    if (String(idOf(media.site)) !== String(site))
      throw new APIError("Hero media must belong to the same site.", 400);
  }
  return data;
};

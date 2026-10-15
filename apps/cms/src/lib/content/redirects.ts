import {
  APIError,
  type CollectionConfig,
  type CollectionBeforeChangeHook,
  type CollectionAfterChangeHook,
} from "payload";
import { isAgrochemical } from "./guards";
import {
  contentRead,
  contentWrite,
  scopedCreate,
  contentDelete,
  idOf,
  enforceScope,
  hasRole,
} from "../../access";
export const ProductRedirects: CollectionConfig = {
  slug: "product-redirects",
  admin: { group: "Content", useAsTitle: "fromSlug" },
  hooks: { beforeChange: [enforceScope] },
  access: {
    read: contentRead,
    create: (args) =>
      hasRole(args.req.user, ["super-admin", "site-admin"]) &&
      scopedCreate(args),
    update: (args) =>
      hasRole(args.req.user, ["super-admin", "site-admin"])
        ? contentWrite(args)
        : false,
    delete: (args) =>
      hasRole(args.req.user, ["super-admin", "site-admin"])
        ? contentDelete(args)
        : false,
  },
  indexes: [{ fields: ["site", "fromSlug"], unique: true }],
  fields: [
    { name: "site", type: "relationship", relationTo: "sites", required: true },
    {
      name: "fromSlug",
      type: "text",
      required: true,
      admin: { readOnly: true },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      required: true,
    },
    {
      name: "_status",
      type: "select",
      options: ["published"],
      defaultValue: "published",
      admin: { readOnly: true },
    },
  ],
};
export const validateProductSlug: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (!(await isAgrochemical(req.payload, data.site ?? originalDoc?.site)))
    return data;
  if (!data.slug || data.slug === originalDoc?.slug) return data;
  if (
    originalDoc?.id &&
    req.user &&
    !["super-admin", "site-admin"].includes(req.user.role)
  )
    throw new APIError("Only administrators can change product URLs.", 403);
  const redirects = await req.payload.find({
    collection: "product-redirects",
    where: {
      and: [
        { site: { equals: idOf(data.site ?? originalDoc?.site) } },
        { fromSlug: { equals: data.slug } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
    req,
  });
  if (redirects.docs.length)
    throw new APIError(
      "This slug is reserved by an existing redirect. Choose another slug.",
      400,
    );
  return data;
};
export const saveProductRedirect: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
}) => {
  if (
    !previousDoc ||
    previousDoc.slug === doc.slug ||
    req.context.editorialDraft ||
    !(await isAgrochemical(req.payload, doc.site))
  )
    return doc;
  await req.payload.create({
    collection: "product-redirects",
    data: {
      site: idOf(doc.site) as number,
      fromSlug: previousDoc.slug,
      product: doc.id,
      _status: "published",
    },
    overrideAccess: true,
    req,
  });
  return doc;
};

import {
  APIError,
  type CollectionBeforeChangeHook,
  type CollectionBeforeDeleteHook,
  type Field,
  type Payload,
} from "payload";
import { idOf } from "../../access";
import { publicationErrors, sectionRules, type PageSections } from "./model";
import { interfaceKeys } from "./presentation";

type Ref = { collection: string; id: string | number; path: string };
export function contentReferences(
  fields: Field[],
  data: Record<string, unknown>,
  prefix = "",
  includeHidden = false,
): Ref[] {
  const refs: Ref[] = [];
  if (data.enabled === false && !includeHidden) return refs;
  for (const field of fields) {
    if (field.type === "tabs") {
      for (const tab of field.tabs)
        refs.push(
          ...contentReferences(
            tab.fields,
            "name" in tab
              ? ((data[tab.name] as Record<string, unknown>) ?? {})
              : data,
            prefix,
            includeHidden,
          ),
        );
      continue;
    }
    if (!("name" in field)) {
      if ("fields" in field)
        refs.push(
          ...contentReferences(
            field.fields as Field[],
            data,
            prefix,
            includeHidden,
          ),
        );
      continue;
    }
    if (field.name === "site" && !prefix) continue;
    const value = data[field.name],
      path = prefix ? `${prefix}.${field.name}` : field.name;
    if (value == null) continue;
    if (field.type === "relationship" || field.type === "upload") {
      for (const item of Array.isArray(value) ? value : [value]) {
        const id = idOf(item);
        if (id !== undefined && typeof field.relationTo === "string")
          refs.push({ collection: field.relationTo, id, path });
      }
    } else if (field.type === "group")
      refs.push(
        ...contentReferences(
          field.fields,
          value as Record<string, unknown>,
          path,
          includeHidden,
        ),
      );
    else if (field.type === "array")
      for (const item of value as Record<string, unknown>[])
        refs.push(
          ...contentReferences(field.fields, item, path, includeHidden),
        );
  }
  return refs;
}
export async function isAgrochemical(payload: Payload, site: unknown) {
  const id = idOf(site);
  if (!id) return false;
  const record = await payload.findByID({
    collection: "sites",
    id,
    depth: 0,
    overrideAccess: true,
  });
  return record.slug === "agrochemical";
}
const consumers = [
  "pages",
  "site-presentation",
  "products",
  "banners",
  "resources",
  "media",
] as const;
export async function findUsages(
  payload: Payload,
  target: string,
  id: string | number,
  site: unknown,
) {
  if (idOf(site) === undefined)
    throw new Error(`Missing site for dependency check: ${target}/${id}`);
  const usages: {
    collection: string;
    id: string | number;
    label: string;
    paths: string[];
  }[] = [];
  for (const collection of consumers) {
    // Read the published snapshot, not a newer draft. Explicit internal access is only for integrity checking.
    const config = payload.collections[collection]?.config;
    if (!config) continue;
    const result = await payload.find({
      collection,
      where: {
        and: [
          { site: { equals: idOf(site) } },
          collection === "media"
            ? { isPublic: { equals: true } }
            : { _status: { equals: "published" } },
        ],
      },
      pagination: false,
      depth: 0,
      draft: false,
      overrideAccess: true,
    });
    for (const doc of result.docs) {
      const refs = contentReferences(
        config.fields,
        doc as unknown as Record<string, unknown>,
      ).filter((r) => r.collection === target && String(r.id) === String(id));
      if (refs.length)
        usages.push({
          collection,
          id: doc.id,
          label: ("title" in doc
            ? doc.title
            : "name" in doc
              ? doc.name
              : String((doc as { id: unknown }).id)) as string,
          paths: refs.map((r) => r.path),
        });
    }
  }
  return usages;
}
export const validateEditorialPublication: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  collection,
}) => {
  const merged = { ...originalDoc, ...data };
  if (!(await isAgrochemical(req.payload, merged.site))) return data;
  if (
    collection.slug === "site-presentation" &&
    originalDoc?._status === "published" &&
    data._status === "draft" &&
    !req.context.editorialDraft
  )
    throw new APIError(
      "Site presentation cannot be unpublished. Save a draft instead.",
      400,
    );
  if (
    collection.slug === "pages" &&
    originalDoc &&
    sectionRules[merged.slug] &&
    data._status === "draft" &&
    !req.context.editorialDraft &&
    sectionRules[merged.slug]
  )
    throw new APIError(
      "Core public pages cannot be unpublished. Save a draft instead.",
      400,
    );
  const publishing =
    merged._status === "published" && !req.context.editorialDraft;
  for (const ref of contentReferences(collection.fields, merged, "", true)) {
    const related = await req.payload.findByID({
      collection: ref.collection as "media",
      id: ref.id,
      depth: 0,
      draft: false,
      overrideAccess: true,
      req,
    });
    if (String(idOf(related.site)) !== String(idOf(merged.site)))
      throw new APIError(`${ref.path} must belong to the same site.`, 400);
  }
  if (collection.slug === "media") {
    let usableVariant = false;
    if (merged.pdfVariant) {
      const variant = await req.payload.findByID({
        collection: "media",
        id: idOf(merged.pdfVariant)!,
        depth: 0,
        overrideAccess: true,
        req,
      });
      usableVariant = Boolean(
        variant.isPublic && /^image\/(png|jpeg)$/.test(variant.mimeType ?? ""),
      );
      if (!/^image\/(png|jpeg)$/.test(variant.mimeType ?? ""))
        throw new APIError("PDF variants must be PNG or JPEG images.", 400);
    }
    if (
      originalDoc?.id &&
      !/^image\/(png|jpeg)$/.test(
        req.file?.mimetype ?? merged.mimeType ?? "",
      ) &&
      (Boolean(req.file) || !usableVariant)
    ) {
      const usages = await findUsages(
        req.payload,
        "media",
        originalDoc.id,
        originalDoc.site,
      );
      for (const usage of usages.filter((u) => u.collection === "products")) {
        const product = await req.payload.findByID({
          collection: "products",
          id: usage.id,
          depth: 0,
          draft: false,
          overrideAccess: true,
          req,
        });
        if (product.brochureEnabled !== false)
          throw new APIError(
            "This image is used by a published product brochure. Replace it with PNG/JPEG, or retain an approved PNG/JPEG variant. Disable the brochure before removing compatibility.",
            400,
          );
      }
    }
  }
  if (!publishing) return data;
  if (
    collection.slug === "pages" &&
    originalDoc?.integrationVersion === 1 &&
    data.integrationVersion !== undefined &&
    data.integrationVersion !== 1
  )
    throw new APIError(
      "The editorial migration version cannot be changed.",
      400,
    );
  if (collection.slug === "pages" && sectionRules[merged.slug]) {
    const errors = publicationErrors(
      merged.slug,
      merged.hero,
      merged.content as PageSections,
    );
    if (errors.length) throw new APIError(errors.join(" "), 400);
    for (const key of ["innovations", "finder"])
      if (merged.content?.[key]?.enabled)
        for (const item of merged.content[key].items ?? [])
          if (!item[key === "innovations" ? "product" : "category"])
            throw new APIError(
              `${key}: select a published catalogue record for every card.`,
              400,
            );
  }
  if (
    collection.slug === "products" &&
    merged.brochureEnabled !== false &&
    merged.image
  ) {
    const image = await req.payload.findByID({
      collection: "media",
      id: idOf(merged.image)!,
      depth: 1,
      overrideAccess: true,
      req,
    });
    if (!/^image\/(png|jpeg)$/.test(image.mimeType ?? "") && !image.pdfVariant)
      throw new APIError(
        "Brochure image conversion is unavailable. Retry conversion with a supported PNG/JPEG image or disable the brochure action.",
        400,
      );
    const variant = image.pdfVariant;
    if (
      variant &&
      typeof variant === "object" &&
      (!variant.isPublic ||
        !/^image\/(png|jpeg)$/.test(variant.mimeType ?? "") ||
        String(idOf(variant.site)) !== String(idOf(merged.site)))
    )
      throw new APIError(
        "Approve the same-site brochure image variant before enabling the brochure.",
        400,
      );
  }
  if (collection.slug === "site-presentation") {
    const keys = (merged.copy ?? []).map((c: { key: string }) => c.key);
    if (
      interfaceKeys.some((k) => !keys.includes(k)) ||
      new Set(keys).size !== keys.length
    )
      throw new APIError(
        "Provide exactly one entry for every interface-copy key.",
        400,
      );
  }
  const references = contentReferences(collection.fields, merged);
  for (const ref of references) {
    const related = await req.payload.findByID({
      collection: ref.collection as "media",
      id: ref.id,
      depth: 0,
      draft: false,
      overrideAccess: true,
      req,
    });
    if (String(idOf(related.site)) !== String(idOf(merged.site)))
      throw new APIError(`${ref.path} must belong to the same site.`, 400);
    if (ref.collection === "media") {
      if (collection.slug === "resources" && ref.path === "file") {
        if (related.mimeType !== "application/pdf")
          throw new APIError("Resource file must be a PDF.", 400);
        continue;
      }
      if (!related.isPublic || !related.alt?.trim())
        throw new APIError(
          `${ref.path}: approve public media with alternative text before publishing.`,
          400,
        );
      if (!ref.path.endsWith("file") && !related.mimeType?.startsWith("image/"))
        throw new APIError(`${ref.path}: choose an image.`, 400);
    } else if ("_status" in related && related._status !== "published")
      throw new APIError(
        `${ref.path}: publish the referenced record first.`,
        400,
      );
  }
  return data;
};
export const protectPublishedDependencies: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
  collection,
}) => {
  if (!originalDoc || !(await isAgrochemical(req.payload, originalDoc.site)))
    return data;
  if (req.context.editorialDraft) return data;
  if (
    (data._status === "draft" && originalDoc._status === "published") ||
    (data.isPublic === false && originalDoc.isPublic === true)
  ) {
    const usages = (
      await findUsages(
        req.payload,
        collection.slug,
        originalDoc.id,
        originalDoc.site,
      )
    ).filter(
      (u) =>
        !(
          data.isPublic === false &&
          u.collection === "resources" &&
          u.paths.every((p) => p === "file")
        ),
    );
    if (usages.length)
      throw new APIError(
        `Required by published content: ${usages.map((u) => `${u.collection}: ${u.label} (${u.paths.join(", ")})`).join("; ")}. Replace references first.`,
        400,
      );
  }
  return data;
};
export const protectEditorialDelete: CollectionBeforeDeleteHook = async ({
  id,
  req,
  collection,
}) => {
  const doc = await req.payload.findByID({
    collection: collection.slug as "pages",
    id,
    depth: 0,
    overrideAccess: true,
    req,
  });
  if (!(await isAgrochemical(req.payload, doc.site))) return;
  if (
    collection.slug === "site-presentation" ||
    (collection.slug === "pages" && sectionRules[doc.slug])
  )
    throw new APIError("Core public pages cannot be deleted.", 400);
  const usages = await findUsages(req.payload, collection.slug, id, doc.site);
  if (usages.length)
    throw new APIError(
      `Required by published content: ${usages.map((u) => `${u.collection}: ${u.label}`).join("; ")}. Replace references first.`,
      400,
    );
};

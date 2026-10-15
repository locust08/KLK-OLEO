import type {
  CollectionBeforeChangeHook,
  CollectionAfterChangeHook,
} from "payload";
export const mediaProcessingStatus: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  if (req.context.processingPdfVariant) return data;
  if (req.file) {
    data.pdfVariant = null;
    data.pdfStatus = /^image\/(png|jpeg)$/.test(req.file.mimetype)
      ? "ready"
      : req.file.mimetype.startsWith("image/")
        ? "pending"
        : undefined;
  }
  if (data.pdfVariant) data.pdfStatus = "ready";
  return data;
};
export const processMediaVariant: CollectionAfterChangeHook = async ({
  doc,
  req,
}) => {
  if (
    req.context.processingPdfVariant ||
    !req.file ||
    !doc.mimeType?.startsWith("image/") ||
    /^image\/(png|jpeg)$/.test(doc.mimeType)
  )
    return doc;
  // Workers deliberately do not load native image tooling. Unsupported formats remain usable on the web.
  if (process.env.CMS_CLOUDFLARE === "1") {
    await req.payload.update({
      collection: "media",
      id: doc.id,
      data: { pdfStatus: "unsupported" },
      req,
      context: { ...req.context, processingPdfVariant: true },
      overrideAccess: true,
    });
    return doc;
  }
  try {
    const sharp = (
      await import(
        /* webpackIgnore: true */ /* turbopackIgnore: true */ `${"__sharp".replaceAll("_", "")}`
      )
    ).default;
    const bytes = await sharp(req.file.data, { limitInputPixels: 24000000 })
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();
    const variant = await req.payload.create({
      collection: "media",
      data: {
        site: typeof doc.site === "object" ? doc.site.id : doc.site,
        alt: doc.alt,
        isPublic: doc.isPublic,
        caption: `PDF variant of media ${doc.id}`,
      },
      file: {
        data: bytes,
        mimetype: "image/png",
        name: `media-${doc.id}-pdf.png`,
        size: bytes.byteLength,
      },
      req,
      context: { ...req.context, processingPdfVariant: true },
      overrideAccess: true,
    });
    await req.payload.update({
      collection: "media",
      id: doc.id,
      data: { pdfVariant: variant.id, pdfStatus: "ready" },
      req,
      context: { ...req.context, processingPdfVariant: true },
      overrideAccess: true,
    });
  } catch (error) {
    req.payload.logger.error({
      err: error,
      msg: "PDF media conversion failed",
    });
    await req.payload.update({
      collection: "media",
      id: doc.id,
      data: { pdfStatus: "unsupported" },
      req,
      context: { ...req.context, processingPdfVariant: true },
      overrideAccess: true,
    });
  }
  return doc;
};

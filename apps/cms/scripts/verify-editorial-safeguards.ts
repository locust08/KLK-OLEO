import { getPayload } from "payload";
import config from "../src/payload.config";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";
import { idOf } from "../src/access";
if (
  process.env.CMS_CLOUDFLARE === "1" ||
  !process.env.SQLITE_URL?.includes("klk-cms-integration")
)
  throw Error("Isolated copy only.");
const payload = await getPayload({ config });
const suffix = randomUUID();
const site = (
  await payload.find({
    collection: "sites",
    where: { slug: { equals: "agrochemical" } },
    limit: 1,
  })
).docs[0];
const other = (
  await payload.find({
    collection: "sites",
    where: { slug: { equals: "klk-oleo" } },
    limit: 1,
  })
).docs[0];
const cleanup: {
  collection:
    "resources" | "media" | "products" | "users" | "product-redirects";
  id: number;
}[] = [];
let checks = 0;
try {
  const doc = await PDFDocument.create();
  doc.addPage();
  const bytes = Buffer.from(await doc.save());
  const file = await payload.create({
    collection: "media",
    data: { site: site.id, alt: "QA private document", isPublic: false },
    file: {
      data: bytes,
      mimetype: "application/pdf",
      name: `qa-${suffix}.pdf`,
      size: bytes.length,
    },
  });
  const resource = await payload.create({
    collection: "resources",
    data: {
      site: site.id,
      title: "QA private material",
      slug: `qa-${suffix}`,
      type: "brochure",
      availability: "available",
      file: file.id,
      _status: "published",
    },
  });
  cleanup.push(
    { collection: "resources", id: resource.id },
    { collection: "media", id: file.id },
  );
  await assert.rejects(
    payload.findByID({
      collection: "media",
      id: file.id,
      overrideAccess: false,
    }),
  );
  checks++;
  const publicResource = await payload.findByID({
    collection: "resources",
    id: resource.id,
    overrideAccess: false,
    depth: 1,
  });
  assert.equal(publicResource.title, "QA private material");
  checks++;
  const color = async (background: string) =>
    sharp({ create: { width: 2, height: 2, channels: 3, background } })
      .webp()
      .toBuffer();
  const red = await color("#ff0000");
  const image = await payload.create({
    collection: "media",
    data: { site: site.id, alt: "QA replaceable image", isPublic: true },
    file: {
      data: red,
      mimetype: "image/webp",
      name: `qa-${suffix}.webp`,
      size: red.length,
    },
  });
  const first = await payload.findByID({
    collection: "media",
    id: image.id,
    depth: 1,
  });
  assert.ok(first.pdfVariant, "new WebP has PDF variant");
  checks++;
  const blue = await color("#0000ff");
  await payload.update({
    collection: "media",
    id: image.id,
    data: { alt: "QA replaced image" },
    file: {
      data: blue,
      mimetype: "image/webp",
      name: `qa-${suffix}.webp`,
      size: blue.length,
    },
  });
  const second = await payload.findByID({
    collection: "media",
    id: image.id,
    depth: 1,
  });
  assert.notEqual(
    idOf(first.pdfVariant),
    idOf(second.pdfVariant),
    "replacement must invalidate old variant",
  );
  checks++;
  assert.ok(second.pdfVariant && typeof second.pdfVariant === "object");
  const pixels = await sharp(
    await readFile(resolve("media", second.pdfVariant.filename!)),
  )
    .raw()
    .toBuffer();
  assert.ok(pixels[2] > pixels[0], "PDF variant contains the new blue artwork");
  checks++;
  cleanup.push({ collection: "media", id: image.id });
  if (idOf(first.pdfVariant))
    cleanup.push({ collection: "media", id: Number(idOf(first.pdfVariant)) });
  if (idOf(second.pdfVariant))
    cleanup.push({ collection: "media", id: Number(idOf(second.pdfVariant)) });
  const home = (
    await payload.find({
      collection: "pages",
      where: { slug: { equals: "home" } },
      draft: false,
      limit: 1,
      depth: 0,
    })
  ).docs[0];
  await assert.rejects(
    payload.update({
      collection: "pages",
      id: home.id,
      data: {
        integrationVersion: 0,
        content: {
          ...home.content,
          introduction: { ...home.content?.introduction, heading: "" },
        },
        _status: "published",
      },
    }),
  );
  checks++;
  const user = await payload.create({
    collection: "users",
    data: {
      email: `qa-admin-${suffix}@example.test`,
      password: randomUUID(),
      role: "site-admin",
      sites: [site.id],
    },
  });
  const product = await payload.create({
    collection: "products",
    data: {
      site: site.id,
      name: "QA route target",
      slug: `qa-${suffix}`,
      chemicalDescription: "Test",
      description: "Test",
      claimsReview: "source-only",
      _status: "published",
    },
  });
  const otherProduct = await payload.create({
    collection: "products",
    data: {
      site: other.id,
      name: "QA other target",
      slug: `qa-other-${suffix}`,
      chemicalDescription: "Test",
      description: "Test",
      claimsReview: "source-only",
      _status: "published",
    },
  });
  await assert.rejects(
    payload.update({
      collection: "media",
      id: image.id,
      data: { pdfVariant: image.id },
    }),
  );
  checks++;
  await payload.update({
    collection: "products",
    id: product.id,
    data: { image: image.id, brochureEnabled: true, _status: "published" },
  });
  await assert.rejects(
    payload.update({
      collection: "media",
      id: image.id,
      data: { pdfVariant: null },
    }),
  );
  checks++;
  await assert.rejects(
    payload.update({
      collection: "media",
      id: image.id,
      data: { alt: "Unsafe replacement" },
      file: {
        data: red,
        mimetype: "image/webp",
        name: `qa-unsafe-${suffix}.webp`,
        size: red.length,
      },
    }),
  );
  checks++;
  await payload.update({
    collection: "products",
    id: product.id,
    data: { image: null, brochureEnabled: false, _status: "published" },
  });
  const redirect = await payload.create({
    collection: "product-redirects",
    data: {
      site: site.id,
      fromSlug: `qa-old-${suffix}`,
      product: product.id,
      _status: "published",
    },
  });
  cleanup.push(
    { collection: "product-redirects", id: redirect.id },
    { collection: "products", id: product.id },
    { collection: "products", id: otherProduct.id },
    { collection: "users", id: user.id },
  );
  await assert.rejects(
    payload.update({
      collection: "product-redirects",
      id: redirect.id,
      user,
      overrideAccess: false,
      data: { site: other.id, product: otherProduct.id },
    }),
  );
  checks++;
  console.log(
    `${checks} additional safeguards passed (private PDF, image replacement, immutable validation and redirect scope).`,
  );
} finally {
  for (const record of cleanup) await payload.delete(record);
  await payload.destroy();
}

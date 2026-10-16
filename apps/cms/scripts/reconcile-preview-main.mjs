/** Idempotent preview-only data reconciliation. Preserve independent editorial changes and drafts. */
import { readFile, writeFile } from "node:fs/promises";
const base = process.env.TEST_SERVER_URL;
if (
  !base ||
  !/^https:\/\/agrochemicals-cms-preview-[a-z0-9-]+\.easondev\.workers\.dev$/.test(
    base,
  )
)
  throw Error("Isolated preview target required.");
const login = await fetch(base + "/api/users/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    email: process.env.CMS_ADMIN_EMAIL,
    password: process.env.CMS_ADMIN_PASSWORD,
  }),
});
if (!login.ok) throw Error("Preview sign-in failed");
const { token } = await login.json();
const headers = {
  "content-type": "application/json",
  Origin: base,
  Authorization: `JWT ${token}`,
};
async function api(path, method = "GET", data) {
  const r = await fetch(base + path, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = await r.json();
  if (!r.ok)
    throw Error(
      `${method} ${path}: ${r.status} ${JSON.stringify(body.errors)}`,
    );
  return body;
}
const site = (await api("/api/sites?where[slug][equals]=agrochemical&depth=0"))
  .docs[0].id;
const baseline = JSON.parse(
  await readFile("data/editorial-baseline.json", "utf8"),
);
const old = JSON.parse(
  await readFile("data/agrochemical-products-before-reconcile.json", "utf8"),
);
const next = JSON.parse(
  await readFile("data/agrochemical-products.json", "utf8"),
);
const report = { updated: [], preserved: [] };
const backup={};for(const collection of ['pages','site-presentation','products','media']){backup[collection]={published:await api(`/api/${collection}?limit=200&depth=0&draft=false`),drafts:collection==='media'?undefined:await api(`/api/${collection}?limit=200&depth=0&draft=true`)};}await writeFile(`/private/tmp/klk-preview-content-before-reconcile-${Date.now()}.json`,JSON.stringify(backup),{mode:0o600});
const keys = {
  pages: [
    "site",
    "title",
    "slug",
    "template",
    "hero",
    "content",
    "sections",
    "seo",
    "sourceURL",
  ],
  products: [
    "site",
    "name",
    "slug",
    "chemicalDescription",
    "description",
    "functions",
    "formulationTypes",
    "regulatoryLabels",
    "image",
    "resources",
    "manufacturingRegion",
    "casNumber",
    "claimsReview",
    "brochureEnabled",
    "seo",
    "sourceRow",
    "sourceNumber",
    "sourceDocument",
    "sourceCells",
  ],
  "site-presentation": [
    "site",
    "name",
    "brandName",
    "contactEmail",
    "navigation",
    "footer",
    "copy",
    "catalogue",
  ],
};
const fields = (collection, doc) =>
  Object.fromEntries(
    keys[collection].filter((k) => k in doc).map((k) => [k, doc[k]]),
  );
async function reconcile(collection, doc, transform) {
  const draft = await api(`/api/${collection}/${doc.id}?depth=0&draft=true`);
  const data = transform(fields(collection, doc));
  if (JSON.stringify(data) === JSON.stringify(fields(collection, doc))) return;
  await api(`/api/${collection}/${doc.id}`, "PATCH", {
    ...data,
    _status: "published",
  });
  if (draft._status === "draft")
    await api(`/api/${collection}/${doc.id}?draft=true`, "PATCH", {
      ...transform(fields(collection, draft)),
      _status: "draft",
    });
  report.updated.push(`${collection}/${doc.id}`);
}
const defaults = {
  functionLabel: ["Product Function", "Functionality"],
  formulationLabel: ["Formulation", "Formulation Type"],
  regulationLabel: ["Regulation / Labels", "Regulatory/Labels"],
  brochure: ["Product brochure", "Request Brochure"],
};
const presentation = (
  await api(
    "/api/site-presentation?where[site][equals]=" +
      site +
      "&draft=false&depth=0",
  )
).docs[0];
await reconcile("site-presentation", presentation, (doc) => {
  const copy = (doc.copy ?? []).map(c=>({...c}));
  for (const entry of baseline.presentation.copy) {
    if (!copy.some((c) => c.key === entry.key)) copy.push({ ...entry });
  }
  for (const c of copy) {
    const replacement = defaults[c.key];
    if (replacement && c.text === replacement[0]) c.text = replacement[1];
  }
  return { ...doc, copy };
});
const images = {};
for (const variant of ["desktop", "tablet", "mobile"]) {
  const caption = `reconcile-main:c304cbe:contact-${variant}`;
  let media = (
    await api(
      "/api/media?where[caption][equals]=" +
        encodeURIComponent(caption) +
        "&depth=0",
    )
  ).docs[0];
  if (!media) {
    const form = new FormData();
    form.set(
      "_payload",
      JSON.stringify({
        site,
        isPublic: true,
        alt: `KLK OLEO Agrochemicals contact banner for ${variant}`,
        caption,
      }),
    );
    form.set(
      "file",
      new Blob(
        [await readFile(`public/images/contact/contact-hero-${variant}.png`)],
        { type: "image/png" },
      ),
      `contact-hero-${variant}.png`,
    );
    const r = await fetch(base + "/api/media", {
      method: "POST",
      headers: { Authorization: `JWT ${token}`, Origin: base },
      body: form,
    });
    const result = await r.json();
    if (!r.ok)
      throw Error(
        "Contact artwork upload failed: " + JSON.stringify(result.errors),
      );
    media = result.doc;
  }
  images[variant] = media.id;
}
const contact = (
  await api("/api/pages?where[slug][equals]=contact&depth=1&draft=false")
).docs[0];
const oldImage = contact.hero?.image;
if (
  oldImage &&
  typeof oldImage === "object" &&
  (oldImage.filename?.startsWith("agrochemical-spraying-hero") ||
    oldImage.caption?.startsWith("reconcile-main:"))
) {
  const record = await api("/api/pages/" + contact.id + "?depth=0&draft=false");
  const oldID = oldImage.id;
  await reconcile("pages", record, (doc) =>
    doc.hero?.image === oldID || doc.hero?.image === images.desktop
      ? {
          ...doc,
          hero: {
            ...doc.hero,
            image: images.desktop,
            tabletImage: images.tablet,
            mobileImage: images.mobile,
          },
        }
      : doc,
  );
} else
  report.preserved.push("Contact hero: independent CMS selection retained.");
const products = (
  await api(
    "/api/products?where[site][equals]=" +
      site +
      "&limit=200&depth=0&draft=false",
  )
).docs;
for (const product of products) {
  const previous = old.find((p) => p.slug === product.slug),
    desired = next.find((p) => p.slug === product.slug);
  if (!previous || !desired) continue;
  await reconcile("products", product, (doc) => {
    const result = { ...doc };
    for (const key of ["description", "chemicalDescription"]) {
      if (previous[key] === desired[key] || doc[key] === desired[key]) continue;
      if (doc[key] === previous[key]) result[key] = desired[key];
      else
        report.preserved.push(
          `${product.slug}.${key}: independent edit retained`,
        );
    }
    return result;
  });
}
await writeFile(
  "/private/tmp/klk-reconcile-content-report.json",
  JSON.stringify(report, null, 2),
);
console.log(
  `Reconciled ${report.updated.length} records; preserved ${report.preserved.length} independent edits. Report saved privately.`,
);

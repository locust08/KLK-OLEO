import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
const base = process.env.TEST_SERVER_URL;
if (
  !base ||
  !/^https:\/\/agrochemicals-cms-preview-[a-z0-9-]+\.easondev\.workers\.dev$/.test(
    base,
  )
)
  throw Error(
    "Set TEST_SERVER_URL to the isolated Agrochemical preview Worker; production is forbidden.",
  );
const login = await fetch(base + "/api/users/login", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    email: process.env.CMS_ADMIN_EMAIL,
    password: process.env.CMS_ADMIN_PASSWORD,
  }),
});
assert.equal(login.status, 200, "preview CMS login");
const loginCookie = login.headers
  .getSetCookie()
  .map((x) => x.split(";")[0])
  .join("; ");
const { token } = await login.json();
const auth = {
  Origin: base,
  Authorization: `JWT ${token}`,
  "content-type": "application/json",
};
const api = async (path, method = "GET", data) => {
  const r = await fetch(base + path, {
    method,
    headers: auth,
    body: data ? JSON.stringify(data) : undefined,
  });
  const j = await r.json();
  assert.ok(
    r.ok,
    `${method} ${path}: ${r.status} ${JSON.stringify(j.errors ?? "")}`,
  );
  return j;
};
const sites = await api("/api/sites?where[slug][equals]=agrochemical");
const site = sites.docs[0].id;
let fixture, privateImage, pageFixture;
try {
  const home = (
    await api("/api/pages?where[slug][equals]=home&depth=0&draft=false")
  ).docs[0];
  const withoutArrayIds = (value) =>
    Array.isArray(value)
      ? value.map(withoutArrayIds)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value)
              .filter(([key]) => key !== "id")
              .map(([key, value]) => [key, withoutArrayIds(value)]),
          )
        : value;
  const pageData = {
    site,
    title: "Preview full page write verification",
    slug: "preview-full-page-write-verification",
    template: "home",
    hero: withoutArrayIds(home.hero),
    content: withoutArrayIds(home.content),
    sections: withoutArrayIds(home.sections),
    _status: "published",
  };
  pageFixture = (await api("/api/pages", "POST", pageData)).doc.id;
  const updatedPage = await api("/api/pages/" + pageFixture, "PATCH", {
    ...pageData,
    title: "Preview full page write verified",
  });
  assert.equal(updatedPage.doc.title, "Preview full page write verified");
  console.log(
    "Cloudflare full homepage-shaped publication passed, including all named sections and arrays.",
  );
  const media = await api("/api/media?limit=100");
  const image = media.docs.find(
    (m) => m.isPublic && m.mimeType === "image/png",
  );
  assert.ok(image, "public PNG available");
  const text =
    "Brochure verification: the formulation supports agricultural applications while maintaining readable technical information. ";
  const created = await api("/api/products", "POST", {
    site,
    name: "Preview PDF Verification",
    slug: "preview-pdf-verification",
    chemicalDescription: "Poppins, image and pagination verification",
    description: text.repeat(140),
    claimsReview: "source-only",
    brochureEnabled: true,
    image: image.id,
    _status: "published",
  });
  fixture = created.doc.id;
  const pdf = await fetch(
    base + "/api/products/preview-pdf-verification/brochure",
  );
  assert.equal(pdf.status, 200);
  const bytes = Buffer.from(await pdf.arrayBuffer());
  assert.equal(bytes.subarray(0, 4).toString(), "%PDF");
  await writeFile("/private/tmp/klk-cloud-image-multipage.pdf", bytes);
  console.log(
    "Cloudflare image + long content PDF passed:",
    bytes.length,
    "bytes",
  );
  const picture = await fetch(new URL(image.url, base));
  assert.equal(picture.status, 200);
  const imageBytes = await picture.arrayBuffer();
  const form = new FormData();
  form.set(
    "_payload",
    JSON.stringify({
      site,
      alt: "Private draft verification image",
      isPublic: false,
    }),
  );
  form.set(
    "file",
    new Blob([imageBytes], { type: "image/png" }),
    "preview-private-verification.png",
  );
  const uploaded = await fetch(base + "/api/media", {
    method: "POST",
    headers: { Authorization: `JWT ${token}` },
    body: form,
  });
  assert.equal(uploaded.status, 201);
  const privateDoc = (await uploaded.json()).doc;
  privateImage = privateDoc.id;
  const anonymousFile = await fetch(new URL(privateDoc.url, base));
  assert.ok(
    [403, 404].includes(anonymousFile.status),
    "private file denied anonymously",
  );
  const authorizedFile = await fetch(new URL(privateDoc.url, base), {
    headers: { Authorization: `JWT ${token}` },
  });
  assert.equal(authorizedFile.status, 200);
  await api("/api/products/" + fixture + "?draft=true", "PATCH", {
    description: "PRIVATE-DRAFT-VERIFICATION",
    image: privateImage,
    _status: "draft",
  });
  const publicHtml = await (
    await fetch(base + "/products/product/preview-pdf-verification")
  ).text();
  assert.ok(
    !publicHtml.includes("PRIVATE-DRAFT-VERIFICATION"),
    "draft never appears publicly",
  );
  const denied = await fetch(
    base + "/api/preview?path=/products/product/preview-pdf-verification",
    { redirect: "manual" },
  );
  assert.equal(denied.status, 403);
  const entered = await fetch(
    base + "/api/preview?path=/products/product/preview-pdf-verification",
    { redirect: "manual", headers: { Origin: base, cookie: loginCookie } },
  );
  assert.equal(entered.status, 303);
  const cookie = [
    loginCookie,
    ...entered.headers.getSetCookie().map((x) => x.split(";")[0]),
  ].join("; ");
  assert.ok(cookie.includes("__prerender_bypass"));
  const headers = { Origin: base, cookie };
  const draft = await (
    await fetch(base + "/products/product/preview-pdf-verification", {
      headers,
    })
  ).text();
  assert.ok(draft.includes("PRIVATE-DRAFT-VERIFICATION"));
  assert.ok(draft.includes("Draft preview"));
  const draftPdf = await fetch(
    base + "/api/products/preview-pdf-verification/brochure",
    { headers },
  );
  assert.equal(draftPdf.status, 200);
  assert.match(draftPdf.headers.get("content-disposition"), /DRAFT-/);
  await writeFile(
    "/private/tmp/klk-cloud-draft.pdf",
    Buffer.from(await draftPdf.arrayBuffer()),
  );
  const exited = await fetch(base + "/api/preview?exit=1", {
    headers,
    redirect: "manual",
  });
  assert.equal(exited.status, 303);
  console.log(
    "Cloudflare authenticated draft page/PDF with private image, anonymous file rejection, public isolation and preview exit passed.",
  );
} finally {
  if (pageFixture) await api("/api/pages/" + pageFixture, "DELETE");
  if (fixture) await api("/api/products/" + fixture, "DELETE");
  if (privateImage) await api("/api/media/" + privateImage, "DELETE");
}

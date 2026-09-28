import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

const base = process.env.TEST_SERVER_URL || "http://127.0.0.1:3010";
let token = "";
const created: { collection: string; id: number }[] = [];
const email = `smoke-${randomUUID()}@example.com`;
async function api(path: string, method = "GET", data?: unknown, auth = false) {
  const response = await fetch(base + path, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Authorization: `JWT ${token}` } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  const body = await response.json();
  return { status: response.status, body };
}
try {
  const login = await api("/api/users/login", "POST", {
    email: process.env.CMS_ADMIN_EMAIL,
    password: process.env.CMS_ADMIN_PASSWORD,
  });
  assert.equal(login.status, 200);
  token = login.body.token;
  const sites = await api("/api/sites?where[slug][equals]=agrochemical");
  const site = sites.body.docs[0];
  assert.equal(site.kind, "minisite");
  const products = await api("/api/products?limit=1");
  assert.equal(products.status, 200);
  assert.equal(products.body.totalDocs, 0);
  assert.equal((await api("/api/leads")).status, 403);
  assert.equal((await api("/api/routing-profiles")).status, 403);
  const resources = await api("/api/resources");
  assert.equal(resources.body.totalDocs, 3);
  assert(
    resources.body.docs.every(
      (r: any) => r.availability === "placeholder" && !r.file,
    ),
  );
  const profiles = await api(
    "/api/routing-profiles?where[slug][equals]=general-enquiry",
    "GET",
    undefined,
    true,
  );
  const profile = profiles.body.docs[0];
  const form = await api(
    "/api/forms",
    "POST",
    {
      site: site.id,
      slug: `smoke-${randomUUID()}`,
      name: "HTTP smoke form",
      purpose: "general-enquiry",
      routingProfile: profile.id,
      consentLabel: "Test consent wording.",
      _status: "published",
    },
    true,
  );
  assert.equal(form.status, 201, JSON.stringify(form.body));
  created.push({ collection: "forms", id: form.body.doc.id });
  const request = {
    siteSlug: "agrochemical",
    formSlug: form.body.doc.slug,
    firstName: "Test",
    email,
    message: "Test submission; delete after verification.",
    consent: true,
    idempotencyKey: randomUUID(),
  };
  const publicForm = await api(`/api/forms/${form.body.doc.id}`);
  assert.equal(publicForm.status, 200);
  assert.equal(
    publicForm.body.routingProfile,
    undefined,
    "Public form responses cannot expose CRM routing profiles",
  );
  assert.equal(
    (await api("/api/enquiries", "POST", { ...request, consent: false }))
      .status,
    400,
  );
  assert.equal(
    (
      await api("/api/enquiries", "POST", {
        ...request,
        formSlug: "unpublished",
      })
    ).status,
    404,
  );
  const accepted = await api("/api/enquiries", "POST", request);
  assert.equal(accepted.status, 202, JSON.stringify(accepted.body));
  assert.equal((await api("/api/enquiries", "POST", request)).status, 202);
  const leads = await api(
    `/api/leads?where[email][equals]=${encodeURIComponent(email)}`,
    "GET",
    undefined,
    true,
  );
  assert.equal(leads.body.totalDocs, 1, "Repeated submission creates one lead");
  created.push({ collection: "leads", id: leads.body.docs[0].id });
  assert.equal(leads.body.docs[0].deliveryStatus, "manual-review");
  assert.equal(leads.body.docs[0].consentText, "Test consent wording.");
  console.log(
    "HTTP checks passed: admin login, public draft privacy, protected leads/routing, resource placeholders, form validation, server-side routing, consent capture, and idempotent lead creation.",
  );
} finally {
  for (const item of [...created].reverse()) {
    const result = await api(
      `/api/${item.collection}/${item.id}`,
      "DELETE",
      undefined,
      true,
    );
    assert.equal(result.status, 200);
  }
}

import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../src/payload.config";

const payload = await getPayload({ config });
const base = "http://127.0.0.1:3000";
const prefix = "resource-flow-verification";
const prepare = process.argv.includes("--prepare");
try {
  const site = (await payload.find({ collection: "sites", where: { slug: { equals: "agrochemical" } }, depth: 0 })).docs[0];
  assert(site);
  if (prepare) {
    const functionTag = await payload.create({ collection: "product-functions", data: { site: site.id, name: "QA Resource Function", slug: `${prefix}-function`, _status: "published" } });
    const formulation = await payload.create({ collection: "formulation-types", data: { site: site.id, name: "QA Resource Formulation", slug: `${prefix}-formulation`, _status: "published" } });
    const label = await payload.create({ collection: "regulatory-labels", data: { site: site.id, name: "QA Resource Label", slug: `${prefix}-label`, _status: "published" } });
    const resource = await payload.create({ collection: "resources", data: { site: site.id, title: "QA Resource Request Guide", slug: `${prefix}-guide`, type: "technical-guide", availability: "placeholder", _status: "published" } });
    await payload.create({ collection: "products", data: { site: site.id, name: "QA Resource Product", slug: `${prefix}-product`, claimsReview: "source-only", chemicalDescription: "Temporary verification product", description: "Temporary verification product. Remove after testing.", functions: [functionTag.id], formulationTypes: [formulation.id], regulatoryLabels: [label.id], resources: [resource.id], _status: "published" } });
    console.log("Temporary CMS resource and associated product/taxonomy prepared.");
  } else {
    const resource = (await payload.find({ collection: "resources", where: { slug: { equals: `${prefix}-guide` } }, depth: 0 })).docs[0];
    assert(resource);
    const request = { siteSlug: "agrochemical", formSlug: "resource-request", firstName: "Resource QA Customer", company: "Verification only", email: "resource-qa@example.com", phone: "+60 123456789", country: "Malaysia", message: "Verification only", resourceId: resource.id, sourceURL: `${base}/resources`, consent: true, idempotencyKey: randomUUID() };
    const post = async (data: unknown, origin = base) => fetch(`${base}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json", Origin: origin }, body: JSON.stringify(data) });
    assert.equal((await post({ ...request, email: "bad" })).status, 400);
    assert.equal((await post({ ...request, company: "" })).status, 400);
    assert.equal((await post({ ...request, resourceId: 999999 })).status, 400);
    assert.equal((await post({ ...request, sourceURL: "https://external.example/resources" })).status, 400);
    assert.equal((await post(request, "https://external.example")).status, 403);
    assert.equal((await post(request)).status, 202);
    const retry = await post(request);
    assert.equal(retry.status, 202);
    assert.match((await retry.json()).message, /sales team/);
    const leads = await payload.find({ collection: "leads", where: { email: { equals: request.email } }, depth: 1, pagination: false });
    const apiLead = leads.docs.filter(lead => lead.idempotencyKey.endsWith(request.idempotencyKey));
    assert.equal(apiLead.length, 1, "Retry must not duplicate the lead");
    const lead = apiLead[0];
    assert.equal(lead.deliveryStatus, "manual-review");
    assert.match(lead.message || "", /QA Resource Request Guide/);
    assert.match(lead.message || "", /QA Resource Product/);
    assert.match(lead.message || "", /Resources \/ Download Request/);
    assert.match(lead.message || "", /\+60 123456789/);
    assert.match(lead.message || "", /\/resources/);
    assert(lead.createdAt && lead.consentAt && lead.routingProfile && lead.product);
    const profile = typeof lead.routingProfile === "object" ? lead.routingProfile : await payload.findByID({ collection: "routing-profiles", id: lead.routingProfile });
    console.log(JSON.stringify({ persisted: true, routingMode: profile.mode, destinationTeam: profile.destinationTeam, source: "Resources / Download Request", idempotency: true, invalidRequestsRejected: true }));
    // Remove all browser/API QA leads and temporary records, preserving pre-existing content.
    for (const item of leads.docs) await payload.delete({ collection: "leads", id: item.id });
  }
} finally {
  if (!prepare) {
    const browserLeads = await payload.find({ collection: "leads", where: { email: { equals: "resource-browser-qa@example.com" } }, pagination: false });
    for (const lead of browserLeads.docs) {
      assert.match(lead.message || "", /QA Resource Request Guide/);
      await payload.delete({ collection: "leads", id: lead.id });
    }
    for (const collection of ["products", "resources", "product-functions", "formulation-types", "regulatory-labels"] as const) {
      const records = await payload.find({ collection, where: { slug: { contains: prefix } }, depth: 0, pagination: false });
      for (const record of records.docs) await payload.delete({ collection, id: record.id });
    }
    console.log("Temporary CMS fixtures and leads removed.");
  }
  await payload.destroy();
}
process.exit(0);

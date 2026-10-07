import "dotenv/config";
import { getPayload } from "payload";
import config from "../src/payload.config";
import { agrochemicalResourceDelivery } from "../src/lib/resource-delivery";

const payload = await getPayload({ config });
try {
  const site = (await payload.find({ collection: "sites", where: { slug: { equals: "agrochemical" } }, depth: 0, limit: 1 })).docs[0];
  if (!site) throw new Error("Agrochemical site must be configured first.");
  const existing = await payload.find({ collection: "forms", where: { and: [{ site: { equals: site.id } }, { slug: { equals: agrochemicalResourceDelivery.formSlug } }] }, limit: 1 });
  if (existing.docs.length) console.log("Resources request form already exists; editor changes preserved.");
  else {
    const routing = (await payload.find({ collection: "routing-profiles", where: { and: [{ site: { equals: site.id } }, { slug: { equals: "general-enquiry" } }] }, depth: 0, limit: 1 })).docs[0];
    if (!routing || routing.mode !== "manual") throw new Error("Existing manual Agrochemical sales routing is required.");
    await payload.create({ collection: "forms", data: {
      site: site.id, name: "Resources / Download Request", slug: agrochemicalResourceDelivery.formSlug,
      purpose: routing.purpose, routingProfile: routing.id,
      consentLabel: "I agree that KLK OLEO may use my submitted details to respond to this resource request.",
      successMessage: agrochemicalResourceDelivery.successMessage, _status: "published",
    } });
    console.log("Resources request form configured with existing sales routing. No email sending enabled.");
  }
} finally { await payload.destroy(); }
process.exit(0);

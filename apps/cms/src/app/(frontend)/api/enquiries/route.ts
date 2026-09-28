import { getPayload } from "payload";
import config from "@payload-config";
import { z } from "zod";
import { idOf } from "@/access";

const submission = z.object({
  siteSlug: z.string().min(1).max(100),
  formSlug: z.string().min(1).max(100),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional(),
  email: z.email().max(254),
  company: z.string().trim().max(200).optional(),
  country: z.string().trim().max(100).optional(),
  message: z.string().trim().min(1).max(5000),
  productId: z.union([z.number(), z.string()]).optional(),
  consent: z.literal(true),
  idempotencyKey: z.uuid(),
  website: z.string().max(200).optional(),
});
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return Response.json(
      { error: "Cross-origin submissions are disabled." },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") || 0) > 20_000)
    return Response.json(
      { error: "Submission is too large." },
      { status: 413 },
    );
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 20_000)
      return Response.json(
        { error: "Submission is too large." },
        { status: 413 },
      );
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const result = submission.safeParse(body);
  if (!result.success)
    return Response.json(
      { error: "Please check the required fields." },
      { status: 400 },
    );
  const input = result.data;
  if (input.website) return Response.json({ accepted: true }, { status: 202 });
  const payload = await getPayload({ config });
  const sites = await payload.find({
    collection: "sites",
    where: {
      and: [{ slug: { equals: input.siteSlug } }, { active: { equals: true } }],
    },
    depth: 0,
    overrideAccess: false,
    limit: 1,
  });
  const site = sites.docs[0];
  if (!site)
    return Response.json({ error: "Site unavailable." }, { status: 404 });
  const forms = await payload.find({
    collection: "forms",
    where: {
      and: [
        { site: { equals: site.id } },
        { slug: { equals: input.formSlug } },
        { _status: { equals: "published" } },
      ],
    },
    depth: 0,
    limit: 1,
    overrideAccess: true,
  });
  const form = forms.docs[0];
  if (!form)
    return Response.json({ error: "Form unavailable." }, { status: 404 });
  const profileID = idOf(form.routingProfile);
  if (!profileID)
    return Response.json(
      { error: "Form routing is not configured." },
      { status: 503 },
    );
  const profile = await payload.findByID({
    collection: "routing-profiles",
    id: profileID,
    depth: 0,
    overrideAccess: true,
  });
  if (
    String(idOf(profile.site)) !== String(site.id) ||
    profile.purpose !== form.purpose
  )
    return Response.json(
      { error: "Form routing is not configured." },
      { status: 503 },
    );
  if (profile.mode === "crm")
    return Response.json(
      { error: "CRM delivery is not enabled for this form." },
      { status: 503 },
    );
  if (input.productId) {
    const product = await payload.find({
      collection: "products",
      where: {
        and: [
          { id: { equals: input.productId } },
          { site: { equals: site.id } },
          { _status: { equals: "published" } },
        ],
      },
      limit: 1,
      depth: 0,
      overrideAccess: false,
    });
    if (!product.docs.length)
      return Response.json({ error: "Product unavailable." }, { status: 400 });
  }
  const key = `${site.id}:${form.id}:${input.idempotencyKey}`;
  const existing = await payload.find({
    collection: "leads",
    where: { idempotencyKey: { equals: key } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  if (!existing.docs.length) {
    try {
      await payload.create({
        collection: "leads",
        overrideAccess: true,
        data: {
          site: site.id,
          form: form.id,
          purpose: form.purpose,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          company: input.company,
          country: input.country,
          message: input.message,
          product: input.productId ? Number(input.productId) : undefined,
          consentAt: new Date().toISOString(),
          consentText: form.consentLabel,
          routingProfile: profile.id,
          deliveryStatus: "manual-review",
          idempotencyKey: key,
        },
      });
    } catch (error) {
      const retry = await payload.find({
        collection: "leads",
        where: { idempotencyKey: { equals: key } },
        limit: 1,
        overrideAccess: true,
      });
      if (!retry.docs.length) {
        console.error(
          "Lead persistence failed",
          error instanceof Error ? error.name : "UnknownError",
        );
        return Response.json(
          { error: "Please try again later." },
          { status: 503 },
        );
      }
    }
  }
  return Response.json(
    { accepted: true, message: form.successMessage },
    { status: 202 },
  );
}

import { getPayload } from "payload";
import config from "@payload-config";
import { idOf } from "@/access";
import { enquirySubmission, resourceLeadMessage } from "@/lib/enquiry-validation";

function publicRequestOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProtocol || new URL(request.url).protocol.replace(":", "");
  return host ? `${protocol}://${host}` : new URL(request.url).origin;
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (
    origin &&
    origin !== new URL(request.url).origin &&
    origin !== publicRequestOrigin(request)
  )
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
  const result = enquirySubmission.safeParse(body);
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
  let leadMessage = input.message;
  let linkedProductId: number | undefined;
  if (input.resourceId !== undefined) {
    const resources = await payload.find({ collection: "resources", where: { and: [
      { id: { equals: input.resourceId } }, { site: { equals: site.id } }, { _status: { equals: "published" } },
    ] }, limit: 1, depth: 0, overrideAccess: false, draft: false });
    const resource = resources.docs[0];
    if (!resource) return Response.json({ error: "This resource is no longer available. Please refresh Resources." }, { status: 400 });
    if (input.sourceURL) {
      const source = new URL(input.sourceURL);
      if (source.origin !== publicRequestOrigin(request) && source.origin !== new URL(request.url).origin)
        return Response.json({ error: "Invalid source page." }, { status: 400 });
      if (source.pathname !== "/resources") return Response.json({ error: "Invalid resource request source." }, { status: 400 });
    }
    const products = await payload.find({ collection: "products", where: { and: [
      { resources: { contains: resource.id } }, { site: { equals: site.id } }, { _status: { equals: "published" } },
    ] }, depth: 0, pagination: false, overrideAccess: false });
    linkedProductId = products.docs.length === 1 ? products.docs[0].id : undefined;
    leadMessage = resourceLeadMessage(input, resource, products.docs);
    // Future confirmation email belongs after durable lead persistence, with client sender credentials.
    // Current manual-review routing intentionally sends no external email or files.
  }
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
          jobPosition: input.jobPosition,
          companyWebsite: input.companyWebsite,
          country: input.country,
          message: leadMessage,
          product: input.resourceId ? linkedProductId : input.productId ? Number(input.productId) : undefined,
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

import { z } from "zod";
import { agrochemicalResourceDelivery } from "./resource-delivery";

export const enquirySubmission = z.object({
  siteSlug: z.string().min(1).max(100), formSlug: z.string().min(1).max(100),
  firstName: z.string().trim().min(1).max(100), lastName: z.string().trim().max(100).optional(),
  email: z.email().max(254), company: z.string().trim().max(200).optional(),
  jobPosition: z.string().trim().max(200).optional(), companyWebsite: z.string().trim().max(300).optional(),
  country: z.string().trim().min(1).max(100), message: z.string().trim().max(5000),
  productId: z.union([z.number(), z.string()]).optional(),
  resourceId: z.number().int().positive().optional(),
  phone: z.string().trim().max(50).optional(), sourceURL: z.url().max(1000).optional(),
  consent: z.literal(true), idempotencyKey: z.uuid(), website: z.string().max(200).optional(),
}).superRefine((input, ctx) => {
  if (input.resourceId !== undefined) {
    if (input.siteSlug !== "agrochemical" || input.formSlug !== agrochemicalResourceDelivery.formSlug)
      ctx.addIssue({ code: "custom", path: ["resourceId"], message: "Resource requests use the Agrochemical enquiry form." });
    if (!input.company) ctx.addIssue({ code: "custom", path: ["company"], message: "Company is required." });
    if (!input.phone || !/^[+\d() .-]{7,50}$/.test(input.phone) || input.phone.replace(/\D/g, "").length < 7)
      ctx.addIssue({ code: "custom", path: ["phone"], message: "A valid contact number is required." });
    if (input.message.length > 4000) ctx.addIssue({ code: "custom", path: ["message"], message: "Message is too long." });
  } else {
    if (input.formSlug === agrochemicalResourceDelivery.formSlug)
      ctx.addIssue({ code: "custom", path: ["resourceId"], message: "A requested resource is required." });
    // Preserve the existing Contact form requirements.
    if (!input.jobPosition) ctx.addIssue({ code: "custom", path: ["jobPosition"], message: "Job position is required." });
    if (!input.message) ctx.addIssue({ code: "custom", path: ["message"], message: "Message is required." });
  }
});

export function resourceLeadMessage(input: { phone?: string; sourceURL?: string; message: string }, resource: { id: number; title: string; slug: string }, products: Array<{ id: number; name: string }>) {
  return ["Source: Resources / Download Request", `Delivery method: ${agrochemicalResourceDelivery.method}`,
    `Requested resource: ${resource.title}`, `Resource ID: ${resource.id} (${resource.slug})`,
    products.length ? `Associated products: ${products.map(product => `${product.name} (ID ${product.id})`).join(", ")}` : "Associated product: none assigned",
    `Phone / Contact Number: ${input.phone}`, input.sourceURL ? `Source URL: ${input.sourceURL}` : "",
    input.message ? `Customer message: ${input.message}` : ""].filter(Boolean).join("\n");
}

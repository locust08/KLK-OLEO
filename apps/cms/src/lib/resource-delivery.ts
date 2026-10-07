// Other delivery methods are reserved for future platform consumers.
export type ResourceDeliveryMethod = "direct_download" | "sales_enquiry" | "form_auto_download";
export const agrochemicalResourceDelivery = {
  method: "sales_enquiry" as const satisfies ResourceDeliveryMethod,
  formSlug: "resource-request",
  // Temporary copy: replace after client approval. No email delivery is enabled.
  successMessage: "Thank you for your enquiry. Your request has been recorded for our sales team, who will contact you regarding the requested resource.",
};

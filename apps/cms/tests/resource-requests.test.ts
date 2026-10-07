import test from "node:test";
import assert from "node:assert/strict";
import { enquirySubmission, resourceLeadMessage } from "../src/lib/enquiry-validation";



const input = { siteSlug: "agrochemical", formSlug: "resource-request", firstName: "Test Customer", company: "Example", email: "test@example.com", phone: "+60 123456789", country: "Malaysia", message: "", resourceId: 1, consent: true, idempotencyKey: "11111111-1111-4111-8111-111111111111" };
test("resource request accepts optional message and rejects invalid or missing customer fields", () => {
  assert.equal(enquirySubmission.safeParse(input).success, true);
  for (const change of [{ email: "bad" }, { firstName: "" }, { company: " " }, { phone: "......." }, { consent: false }, { country: "" }, { resourceId: -1 }, { message: "x".repeat(4001) }, { siteSlug: "klk-oleo" }])
    assert.equal(enquirySubmission.safeParse({ ...input, ...change }).success, false);
});
test("existing Contact form validation remains required", () => {
  const { resourceId, ...contact } = input;
  assert.equal(enquirySubmission.safeParse(contact).success, false);
  assert.equal(enquirySubmission.safeParse({ ...contact, formSlug: "general-enquiry", jobPosition: "Scientist", message: "Enquiry" }).success, true);
});
test("sales lead context includes canonical resource, phone, source and related product", () => {
  const message = resourceLeadMessage({ ...input, sourceURL: "http://localhost/resources" }, { id: 1, title: "Approved guide", slug: "guide" }, [{ id: 2, name: "Product" }]);
  assert.match(message, /Resources \/ Download Request/); assert.match(message, /Approved guide/); assert.match(message, /Product \(ID 2\)/); assert.match(message, /\+60/); assert.match(message, /sales_enquiry/); assert.doesNotMatch(message, /\.pdf/);
});

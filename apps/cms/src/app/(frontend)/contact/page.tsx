import { ContactPage } from "@/components/contact/ContactPage";
import { getContactForm, getPageContent } from "@/lib/cms/queries";

export default async function Page() {
  const [page, form] = await Promise.all([
    getPageContent("contact"),
    getContactForm(),
  ]);
  return <ContactPage page={page} form={form} />;
}

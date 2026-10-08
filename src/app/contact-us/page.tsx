import type { Metadata } from "next";
import { PrototypePageShell } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";
import { ContactPrototype } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ContactPrototype";

export const metadata: Metadata = { title: "Contact Us | KLK OLEO" };

export default function ContactUsPage() {
  return <PrototypePageShell><ContactPrototype /></PrototypePageShell>;
}

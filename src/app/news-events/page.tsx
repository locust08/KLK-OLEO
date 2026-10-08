import type { Metadata } from "next";
import { PrototypePageShell } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";
import { NewsPrototype } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/NewsPrototype";

export const metadata: Metadata = { title: "News & Events | KLK OLEO" };

export default function NewsEventsPage() {
  return <PrototypePageShell><NewsPrototype /></PrototypePageShell>;
}

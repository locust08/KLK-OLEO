import type { Metadata } from "next";
import { CareersPage } from "@/components/careers/CareersPage";
import { PrototypePageShell } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";

export const metadata: Metadata = {
  title: "Careers | KLK OLEO",
  description: "Empower your future with a global leader in oleochemicals. Explore life at KLK OLEO, career growth and opportunities across the world.",
};

export default function Careers() {
  return <PrototypePageShell><CareersPage /></PrototypePageShell>;
}

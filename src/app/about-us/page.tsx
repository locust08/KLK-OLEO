import type { Metadata } from "next";
import { AboutPrototype } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/AboutPrototype";
import { PrototypePageBanner, PrototypePageShell, prototypeImageRoot } from "@/components/sites/figma-com-fd3c2a3a/shared/PrototypePageShell";

export const metadata: Metadata = {
  title: "KLK OLEO In Brief | KLK OLEO",
  description: "Our background, vision, mission, core values and global presence.",
};

export default function AboutUsPage() {
  return (
    <PrototypePageShell>
      <PrototypePageBanner title="KLK OLEO In Brief" image={`${prototypeImageRoot}/about-top-slider.jpg`} breadcrumbs={[{ label: "KLK OLEO in Brief" }]} />
      <AboutPrototype />
    </PrototypePageShell>
  );
}

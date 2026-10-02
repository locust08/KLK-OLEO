import { AboutMetrics } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/AboutMetrics";
import { HeaderHero } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/HeaderHero";
import { PresenceNewsEsg } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/PresenceNewsEsg";
import {
  CookieBanner,
  ProductExperience,
  SiteFooter,
} from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/ProductExperienceFooter";
import { RiseSolutions } from "@/components/sites/figma-com-fd3c2a3a/proto-klk-oleo-2026-95f6cd74/RiseSolutions";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#202a25]">
      <HeaderHero />
      <AboutMetrics />
      <RiseSolutions />
      <ProductExperience />
      <PresenceNewsEsg />
      <SiteFooter />
      <CookieBanner />
    </main>
  );
}

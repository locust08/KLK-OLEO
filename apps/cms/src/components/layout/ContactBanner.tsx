"use client";

import { useSite } from "./SiteContext";
import { usePathname } from "next/navigation";
import { ContactBannerContent } from "./ContactBannerContent";

export function ContactBanner() {
  const { contactBanner } = useSite();
  const pathname = usePathname();
  if (pathname === "/contact" || pathname.startsWith("/contact/")) return null;
  return (
    <ContactBannerContent section={contactBanner} preserveProductCta={false} />
  );
}

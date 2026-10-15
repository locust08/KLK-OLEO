"use client";

import { usePathname } from "next/navigation";
import { ContactBannerContent } from "./ContactBannerContent";

export function ContactBanner() {
  const pathname = usePathname();
  if (pathname === "/contact" || pathname.startsWith("/contact/")) return null;
  return <ContactBannerContent preserveProductCta={false} />;
}

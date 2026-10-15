"use client";

import { usePathname } from "next/navigation";
import { ContactBannerContent } from "./ContactBannerContent";

export function ContactBanner() {
  const pathname = usePathname();
  const preserveProductCta = pathname === "/products" || pathname.startsWith("/products/");
  return <ContactBannerContent preserveProductCta={preserveProductCta} />;
}

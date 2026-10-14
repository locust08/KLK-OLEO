"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  AGROCHEMICAL_BRAND_NAME,
  type SiteChromeViewModel,
} from "@/lib/cms/view-models";

const fallbackSite: SiteChromeViewModel = {
  name: "KLK OLEO Agrochemicals",
  brandName: AGROCHEMICAL_BRAND_NAME,
  contactEmail: "agrochem@klkoleo.com",
  parentDomain: "https://www.klkoleo.com",
  parentLinkLabel: "Part of KLK OLEO",
  navigation: [
    { label: "About Us", path: "/about-us" },
    { label: "Products", path: "/products" },
    { label: "Resources", path: "/resources" },
    { label: "Contact Us", path: "/contact" },
  ],
};

const SiteContext = createContext(fallbackSite);

export function SiteProvider({
  value,
  children,
}: {
  value: SiteChromeViewModel | null;
  children: ReactNode;
}) {
  const site = value ? {
    ...value,
    navigation: value.navigation.length ? value.navigation : fallbackSite.navigation,
  } : fallbackSite;
  return <SiteContext value={site}>{children}</SiteContext>;
}

export function useSite() {
  return useContext(SiteContext);
}

"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  AGROCHEMICAL_BRAND_NAME,
  type SiteChromeViewModel,
} from "@/lib/cms/view-models";

const SiteContext = createContext<SiteChromeViewModel | null>(null);

export function SiteProvider({
  value,
  children,
}: {
  value: SiteChromeViewModel | null;
  children: ReactNode;
}) {
  return <SiteContext value={value}>{children}</SiteContext>;
}

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error("Site presentation is unavailable.");
  return value;
}

export function useCopy() {
  return useSite().copy;
}

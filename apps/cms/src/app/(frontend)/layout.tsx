import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import type { ReactNode } from "react";
import { SiteProvider } from "@/components/layout/SiteContext";
import { getSiteChrome } from "@/lib/cms/queries";
import "./globals.css";
import "./qa-overrides.css";

export const dynamic = "force-dynamic";

const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  src: [
    { path: "../../../public/fonts/poppins-400.ttf", weight: "400", style: "normal" },
    { path: "../../../public/fonts/poppins-500.ttf", weight: "500", style: "normal" },
    { path: "../../../public/fonts/poppins-600.ttf", weight: "600", style: "normal" },
    { path: "../../../public/fonts/poppins-700.ttf", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "KLK OLEO Agrochemicals",
  description: "KLK OLEO Agrochemicals formulation solutions.",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const site = await getSiteChrome();
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="min-h-full">
        <SiteProvider value={site}>{children}</SiteProvider>
        <Script
          src="https://www.bugherd.com/sidebarv2.js?apikey=jre4xxliq60q0k1jzi9hvw"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

import { editorialReadContext } from "@/lib/cms/preview";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import type { ReactNode } from "react";
import { SiteProvider } from "@/components/layout/SiteContext";
import { getSiteChrome } from "@/lib/cms/queries";
import "./globals.css";
import "./qa-overrides.css";
import "./typography.css";
import "./motion.css";
import "./product-print.css";
import { ScrollAnimations } from "@/components/ui/ScrollAnimations";

export const dynamic = "force-dynamic";

const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  preload: true,
  src: [
    {
      path: "../../../public/fonts/poppins-400.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/poppins-500.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/fonts/poppins-600.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/fonts/poppins-700.ttf",
      weight: "700",
      style: "normal",
    },
  ],
});

export async function generateMetadata(): Promise<Metadata> {
  const { draft } = await editorialReadContext();
  return {
    title: "KLK OLEO Agrochemicals",
    robots: draft ? { index: false, follow: false } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  let site;
  try {
    site = await getSiteChrome();
  } catch (error) {
    console.error("CMS site presentation query failed", error);
  }
  const { draft, user } = await editorialReadContext();
  return (
    <html lang="en" className={`${poppins.variable} h-full`}>
      <body className="min-h-full">
        {site ? (
          <SiteProvider value={site}>
            {draft && user && (
              <aside className="cms-preview-bar">
                Draft preview — unpublished content{" "}
                <a href="/api/preview?exit=1">Exit preview</a>
              </aside>
            )}
            {children}
            <ScrollAnimations />
          </SiteProvider>
        ) : (
          <main role="status">
            <h1>Content temporarily unavailable</h1>
            <p>Please try again shortly.</p>
          </main>
        )}
        <Script
          src="https://www.bugherd.com/sidebarv2.js?apikey=jre4xxliq60q0k1jzi9hvw"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

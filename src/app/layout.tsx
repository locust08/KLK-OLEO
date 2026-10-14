import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KLK OLEO | Everyday Convenience to Global Solutions",
  description:
    "KLK OLEO is a global oleochemical producer delivering innovative and sustainable solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Script
          id="bugherd-sidebar"
          src="https://www.bugherd.com/sidebarv2.js?apikey=uuh7g8qrx9fige1fqxvr6q"
          strategy="afterInteractive"
          async
        />
      </body>
    </html>
  );
}

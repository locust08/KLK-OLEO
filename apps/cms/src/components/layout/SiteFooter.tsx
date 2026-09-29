"use client";

import Image from "next/image";
import Link from "next/link";
import { FaLinkedinIn } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { siteAssets } from "@/data/site-assets";
import { useSite } from "./SiteContext";

const quickLinks = [
  { label: "About", href: "/about-us" },
  { label: "Products", href: "/products" },
  { label: "News & Events", href: "/resources" },
  { label: "Download", href: "/resources" },
  { label: "Contact", href: "/contact" },
] as const;

const products = [
  "Adjuvants",
  "Emulsifiers",
  "Dispersants",
  "Rheology Modifiers",
  "(Co) Solvents",
  "Wetters, Penetrants and Spreaders",
  "Active Ingredients",
  "Defoamer",
  "Soil Moisture Retainers",
  "Humectants",
  "Anti Drift",
  "Tank Mix Adjuvants",
] as const;

const legalLinks = [
  { label: "Disclaimer", href: "https://www.klkoleo.com/lifescience/disclaimer/" },
  {
    label: "Personal Data Notice Statement",
    href: "https://www.klkoleo.com/lifescience/personal-data-notice-statement/",
  },
  { label: "Privacy Notice", href: "https://www.klk.com.my/privacy-notice/" },
  { label: "Cookie Notice", href: "https://www.klkoleo.com/cookie-policy/" },
] as const;

export function SiteFooter() {
  const site = useSite();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <section className="footer-brand" aria-labelledby="footer-brand-title">
          <Image
            className="footer-logo"
            src={siteAssets.footerLogo}
            width={371}
            height={127}
            alt="KLK OLEO"
          />
          <h2 id="footer-brand-title">{site.brandName}</h2>
          <p>
            KLK OLEO Agrochemicals is your trusted partner for high-performance
            and sustainable formulation solutions, supporting agricultural
            innovation from the laboratory to the field.
          </p>
          <a
            className="footer-social"
            href="https://www.linkedin.com/company/klk-oleo/"
            target="_blank"
            rel="noreferrer"
            aria-label="KLK OLEO on LinkedIn"
          >
            <FaLinkedinIn aria-hidden="true" />
          </a>
        </section>

        <nav className="footer-column footer-quick-links" aria-label="Footer quick links">
          <h2>Quick Links</h2>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="footer-column footer-products" aria-label="Product categories">
          <h2>Products</h2>
          <ul>
            {products.map((product) => (
              <li key={product}>
                <Link href="/products/category/functionalities">{product}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="footer-column footer-contact" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">Get in Touch</h2>
          <a href={`mailto:${site.contactEmail}`}>
            <MdEmail aria-hidden="true" />
            <span>{site.contactEmail}</span>
          </a>
        </section>
      </div>

      <div className="footer-bottom">
        <p>2026 KLK OLEO | Agrochemicals All rights reserved</p>
        <nav aria-label="Legal links">
          {legalLinks.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

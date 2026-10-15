"use client";

import Image from "next/image";
import Link from "next/link";
import { FaLinkedinIn } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { siteAssets } from "@/data/site-assets";
import { useSite } from "./SiteContext";

export function SiteFooter() {
  const site = useSite();
  const { footer, copy } = site;
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <section className="footer-brand" aria-labelledby="footer-brand-title">
          {footer.logo && (
            <Image
              unoptimized
              className="footer-logo"
              src={footer.logo.url}
              width={371}
              height={127}
              alt={footer.logo.alt}
            />
          )}
          <h2 id="footer-brand-title">{site.brandName}</h2>
          <p>{footer.description}</p>
          <a
            className="footer-social"
            href={footer.socialPath ?? undefined}
            target="_blank"
            rel="noreferrer"
            aria-label={footer.socialLabel ?? undefined}
          >
            <FaLinkedinIn aria-hidden="true" />
          </a>
        </section>

        <nav
          className="footer-column footer-quick-links"
          aria-label="Footer quick links"
        >
          <h2>{copy.quickLinks}</h2>
          <ul>
            {footer.quickLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.path}
                  target={
                    link.newTab && link.path.startsWith("https://")
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    link.newTab && link.path.startsWith("https://")
                      ? "noreferrer"
                      : undefined
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav
          className="footer-column footer-products"
          aria-label="Product categories"
        >
          <h2>{copy.products}</h2>
          <ul>
            {footer.productLinks.map((product) => (
              <li key={product.path}>
                <Link
                  href={product.path}
                  target={
                    product.newTab && product.path.startsWith("https://")
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    product.newTab && product.path.startsWith("https://")
                      ? "noreferrer"
                      : undefined
                  }
                >
                  {product.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section
          className="footer-column footer-contact"
          aria-labelledby="footer-contact-title"
        >
          <h2 id="footer-contact-title">{copy.getInTouch}</h2>
          <a href={`mailto:${site.contactEmail}`}>
            <MdEmail aria-hidden="true" />
            <span>{site.contactEmail}</span>
          </a>
        </section>
      </div>

      <div className="footer-bottom">
        <p>
          {new Date().getFullYear()} {site.brandName} {copy.copyright}
        </p>
        <nav aria-label="Legal links">
          {footer.legalLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              target={
                link.newTab && link.path.startsWith("https://")
                  ? "_blank"
                  : undefined
              }
              rel={
                link.newTab && link.path.startsWith("https://")
                  ? "noreferrer"
                  : undefined
              }
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

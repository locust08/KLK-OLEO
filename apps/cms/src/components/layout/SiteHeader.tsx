"use client";

import Form from "next/form";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { useSite } from "./SiteContext";

function ProductSearch({ className, inputId }: { className: string; inputId: string }) {
  return (
    <Form className={className} action="/products" role="search">
      <label className="visually-hidden" htmlFor={inputId}>
        Search products
      </label>
      <input
        id={inputId}
        name="q"
        type="search"
        placeholder="Search..."
        aria-label="Search products"
      />
    </Form>
  );
}

export function SiteHeader() {
  const site = useSite();
  const navigation = (
    site.navigation.length
      ? site.navigation
      : [{ label: "Products", path: "/products" }]
  ).filter(({ path }) => path !== "/");
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(pathname.startsWith("/products"));
  return (
    <header className="site-header">
      <Link
        href="/"
        className="site-logo"
        aria-label="KLK OLEO Agrochemicals home"
      >
        <span>{site.brandName}</span>
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map(({ label, path: href }) => href === "/products" ? (
          <div className="desktop-nav__products" key={href}>
            <Link
              href={href}
              className={pathname.startsWith("/products") ? "is-active" : undefined}
            >
              {label}
            </Link>
            <div className="desktop-products-submenu" aria-label="Product categories">
              <Link href="/products/category/functionalities" className={pathname === "/products/category/functionalities" ? "is-active" : undefined}>Functionality</Link>
              <Link href="/products/category/formulation-type" className={pathname === "/products/category/formulation-type" ? "is-active" : undefined}>Formulation Type</Link>
              <Link href="/products/category/regulatory-labels" className={pathname === "/products/category/regulatory-labels" ? "is-active" : undefined}>Regulatory/Labels</Link>
            </div>
          </div>
        ) : (
          <Link
            key={href}
            href={href}
            className={pathname === href || pathname.startsWith(`${href}/`) ? "is-active" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          <span />
          <span />
          <span />
        </button>
        <Link
          href="/products"
          className="header-basket"
          aria-label="Open product finder"
        >
          <svg viewBox="0 0 576 512" aria-hidden="true">
            <path d="M576 216v16c0 13.255-10.745 24-24 24h-8l-26.113 182.788C514.509 462.435 494.257 480 470.37 480H105.63c-23.887 0-44.139-17.565-47.518-41.212L32 256h-8c-13.255 0-24-10.745-24-24v-16c0-13.255 10.745-24 24-24h67.341l106.78-146.821c10.395-14.292 30.407-17.453 44.701-7.058 14.293 10.395 17.453 30.408 7.058 44.701L170.477 192h235.046L326.12 82.821c-10.395-14.292-7.234-34.306 7.059-44.701 14.291-10.395 34.306-7.235 44.701 7.058L484.659 192H552c13.255 0 24 10.745 24 24zM312 392V280c0-13.255-10.745-24-24-24s-24 10.745-24 24v112c0 13.255 10.745 24 24 24s24-10.745 24-24zm112 0V280c0-13.255-10.745-24-24-24s-24 10.745-24 24v112c0 13.255 10.745 24 24 24s24-10.745 24-24zm-224 0V280c0-13.255-10.745-24-24-24s-24 10.745-24 24v112c0 13.255 10.745 24 24 24s24-10.745 24-24z" />
          </svg>
        </Link>
        <ProductSearch className="header-search" inputId="site-search" />
      </div>
      <nav
        className={`mobile-nav ${open ? "is-open" : ""}`}
        aria-label="Mobile navigation"
      >
        <ProductSearch className="mobile-nav__search" inputId="mobile-product-search" />
        {navigation.map(({ label, path: href }) =>
          href === "/products" ? (
            <div className="mobile-nav__products" key={href}>
              <div className="mobile-nav__products-row">
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  className={pathname === href ? "is-active" : undefined}
                >
                  {label}
                </Link>
                <button
                  className={pathname.startsWith("/products") ? "mobile-nav__products-toggle is-active" : "mobile-nav__products-toggle"}
                  type="button"
                  aria-label="Toggle product categories"
                  aria-expanded={productsOpen}
                  aria-controls="mobile-product-categories"
                  onClick={() => setProductsOpen((current) => !current)}
                >
                  <FaChevronDown aria-hidden="true" />
                </button>
              </div>
              <div
                id="mobile-product-categories"
                className={`mobile-products-submenu ${productsOpen ? "is-open" : ""}`}
              >
                <Link href="/products/category/functionalities" onClick={() => setOpen(false)} className={pathname === "/products/category/functionalities" ? "is-active" : undefined}>
                  Functionality
                </Link>
                <Link href="/products/category/formulation-type" onClick={() => setOpen(false)} className={pathname === "/products/category/formulation-type" ? "is-active" : undefined}>
                  Formulation Type
                </Link>
                <Link href="/products/category/regulatory-labels" onClick={() => setOpen(false)} className={pathname === "/products/category/regulatory-labels" ? "is-active" : undefined}>
                  Regulatory/Labels
                </Link>
              </div>
            </div>
          ) : (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={pathname === href || pathname.startsWith(`${href}/`) ? "is-active" : undefined}
            >
              {label}
            </Link>
          ),
        )}
      </nav>
    </header>
  );
}

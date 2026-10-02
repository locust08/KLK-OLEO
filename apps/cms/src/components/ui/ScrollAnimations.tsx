"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const targets = [
  ".intro-media", ".intro-copy", ".capability", ".innovation-card",
  ".finder-reveal", ".contact-reveal", ".resource-card",
  ".catalog-category-intro", ".catalog-product-row", ".product-spec-panel",
  ".product-meta-table", ".contact-copy", "[data-reveal]",
  "main > section > .eyebrow", "main > section > h2",
].join(",");

export function ScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main) return;
    const seen = new WeakSet<HTMLElement>();
    const reveal = (element: HTMLElement) => {
      element.classList.add("motion-visible");
      observer.unobserve(element);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) reveal(entry.target as HTMLElement);
      });
    }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });

    const scan = () => {
      main.querySelectorAll<HTMLElement>(targets).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        const siblings = Array.from(element.parentElement?.children ?? [])
          .filter((sibling) => sibling.matches(targets));
        element.style.setProperty("--reveal-delay", `${Math.max(0, siblings.indexOf(element) % 4) * 100}ms`);
        element.classList.add("motion-enter");
        observer.observe(element);
      });
    };
    scan();
    // Product filtering and pagination can insert cards without a route change.
    const mutations = new MutationObserver(scan);
    mutations.observe(main, { childList: true, subtree: true });
    const onFocus = (event: FocusEvent) => {
      const element = (event.target as HTMLElement).closest<HTMLElement>(".motion-enter");
      if (element) reveal(element);
    };
    main.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      main.removeEventListener("focusin", onFocus);
      main.querySelectorAll(".motion-enter").forEach((element) => {
        element.classList.remove("motion-enter", "motion-visible");
      });
    };
  }, [pathname]);

  return null;
}

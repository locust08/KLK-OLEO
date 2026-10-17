"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

// Names, descriptions and order from the supplied Functionality Description sheet.
const categories = [
  {
    "title": "Adjuvants",
    "copy": "Assist in dissolving active ingredients and formulation components to create stable and effective solutions."
  },
  {
    "title": "Emulsifiers",
    "copy": "Helps sprays stay on leaf surfaces longer, slowing evaporation and enhancing absorption of active ingredients."
  },
  {
    "title": "Dispersants",
    "copy": "Enable stable mixing of oil-based and water-based components, ensuring uniform and stable agrochemical formulations."
  },
  {
    "title": "Rheology modifiers",
    "copy": "Control viscosity and flow behaviour to improve spray stability, handling, and application consistency."
  },
  {
    "title": "(Co) Solvents",
    "copy": "Enhance solubility of active ingredients and support formulation stability across varying conditions."
  },
  {
    "title": "Wetters, Penetrants and Spreaders",
    "copy": "Improve spray coverage and adhesion on leaf surfaces, promoting better uptake of active ingredients."
  },
  {
    "title": "Active Ingredients",
    "copy": "Provide the primary biological effect, targeting pests, weeds, or diseases."
  },
  {
    "title": "Defoamer",
    "copy": "Reduce or prevent foam formation during mixing and application, ensuring accurate dosing and smooth spraying."
  },
  {
    "title": "Soil Moisture Retainers",
    "copy": "Help maintain soil moisture levels by reducing evaporation and improving water availability to plants."
  },
  {
    "title": "Humectants",
    "copy": "Slow down droplet drying to extend surface wetness, allowing more time for active ingredient absorption."
  },
  {
    "title": "Anti Drift",
    "copy": "Minimise spray drift by optimising droplet size, improving on-target deposition and reducing off-target loss."
  },
  {
    "title": "Tank Mix Adjuvants",
    "copy": "Enhance compatibility and performance of mixed products in the spray tank, ensuring consistent and effective application."
  }
];

export function ProductCategoryCarousel() {
  const items = useMemo(() => [...categories, ...categories, ...categories], []);
  const shellRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(categories.length);
  const [slotWidth, setSlotWidth] = useState(421);
  const [shellWidth, setShellWidth] = useState(1425);
  const [transitioning, setTransitioning] = useState(true);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const updateSize = () => {
      const width = shell.getBoundingClientRect().width;
      setShellWidth(width);
      setSlotWidth(Math.min(421, Math.max(280, width - 30)));
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveIndex((current) => current + 1), 3200);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (activeIndex !== categories.length * 2) return;
    const timer = window.setTimeout(() => {
      setTransitioning(false);
      setActiveIndex(categories.length);
      window.requestAnimationFrame(() => window.requestAnimationFrame(() => setTransitioning(true)));
    }, 760);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  const offset = shellWidth / 2 - (activeIndex + 0.5) * slotWidth;
  const activeDot = activeIndex % categories.length;

  return (
    <div
      ref={shellRef}
      className="finder-carousel-shell finder-reveal"
      role="region"
      aria-roledescription="carousel"
      aria-label="Product categories"
    >
      <div
        className={`finder-carousel-track${transitioning ? " is-transitioning" : ""}`}
        style={{
          width: slotWidth * items.length,
          transform: `translate3d(${offset}px, 0, 0)`,
          "--carousel-slot": `${slotWidth}px`,
        } as CSSProperties}
      >
        {items.map((item, index) => (
          <div className="finder-carousel-slot" key={`${item.title}-${index}`} aria-hidden={index !== activeIndex}>
            <article className={`finder-carousel-card${index === activeIndex ? " is-active" : ""}`}>
              <h3>{item.title}</h3>
              <p>{item.copy}</p>
            </article>
          </div>
        ))}
      </div>
      <div className="finder-carousel-dots" aria-label="Choose a product category">
        {categories.map((category, index) => (
          <button
            type="button"
            className={index === activeDot ? "is-active" : ""}
            key={category.title}
            aria-label={`Show ${category.title}`}
            aria-current={index === activeDot ? "true" : undefined}
            onClick={() => {
              setTransitioning(true);
              setActiveIndex(categories.length + index);
            }}
          />
        ))}
      </div>
    </div>
  );
}

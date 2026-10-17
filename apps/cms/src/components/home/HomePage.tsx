"use client";
import { useState } from "react";
import { FaAnglesRight } from "react-icons/fa6";
import { ProductCategoryCarousel } from "./ProductCategoryCarousel";
import { HomeFaq } from "./HomeFaq";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { TextCta } from "@/components/ui/TextCta";
import {
  EditorialMedia,
  imageBackground,
} from "@/components/ui/EditorialMedia";
import type {
  BannerViewModel,
  PageContentViewModel,
} from "@/lib/cms/view-models";
export function HomePage({
  page,
}: {
  page: PageContentViewModel | null;
  banner?: BannerViewModel | null;
}) {
  const [expanded, setExpanded] = useState<number | null>(null);
  if (!page) return null;
  const {
    introduction: intro,
    capabilities,
    innovations,
    finder,
    faq,
    contact,
  } = page.content;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-hero" style={imageBackground(page.heroImage)}>
          <div className="home-hero__content">
            <p className="home-hero__brand">{page.heroEyebrow}</p>
            <div className="home-hero__rule home-hero__rule--leaf" />
            <div className="home-hero__rule home-hero__rule--gold" />
            <h1>{page.heroHeading}</h1>
          </div>
        </section>
        {intro?.enabled && (
          <section className="intro-section">
            <div className="split-intro">
              <div className="intro-media">
                <EditorialMedia image={intro.image} />
              </div>
              <div className="intro-copy">
                <p className="eyebrow">{intro.eyebrow}</p>
                <h2>{intro.heading}</h2>
                <p>{intro.body}</p>
                <ul>
                  {intro.bullets?.map((b, i) => (
                    <li key={i}>{b.text}</li>
                  ))}
                </ul>
                {intro.ctaPath && (
                  <TextCta href={intro.ctaPath}>{intro.ctaLabel}</TextCta>
                )}
              </div>
            </div>
          </section>
        )}
        {capabilities?.enabled && (
          <section className="capability-section">
            <p className="eyebrow">{capabilities.eyebrow}</p>
            <h2>{capabilities.heading}</h2>
            <div className="capability-grid">
              {capabilities.items?.map((item, i) => (
                <article
                  key={i}
                  className={`capability capability--${i + 1}`}
                  tabIndex={0}
                  role="button"
                  aria-label={item.heading}
                  aria-expanded={expanded === i}
                  onClick={() => setExpanded((c) => (c === i ? null : i))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setExpanded((c) => (c === i ? null : i));
                    }
                  }}
                >
                  <div
                    className="capability__panel capability__panel--front"
                    style={imageBackground(item.image)}
                  >
                    <h3>{item.heading}</h3>
                  </div>
                  <div className="capability__panel capability__panel--back">
                    <p>{item.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        {innovations?.enabled && (
          <section
            className="innovation-section"
            style={imageBackground(innovations.image)}
          >
            <p className="eyebrow">{innovations.eyebrow}</p>
            <h2>{innovations.heading}</h2>
            <div className="innovation-grid">
              {innovations.items?.map((item, i) => (
                <article
                  key={i}
                  className={`innovation-card innovation-card--${i + 1}`}
                >
                  <h3>{item.heading}</h3>
                  <p>{item.body}</p>
                  {(item.productPath || item.path) && (
                    <TextCta href={item.productPath || item.path!}>
                      {item.label}
                    </TextCta>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
        {finder?.enabled && (
          <section className="finder-cta">
            <div className="finder-copy finder-copy--title finder-reveal">
              <p className="eyebrow">{finder.eyebrow}</p>
              <h2>{finder.heading}</h2>
            </div>
            <div className="finder-copy finder-copy--action finder-reveal">
              <p>{finder.body}</p>
              {finder.ctaPath && (
                <TextCta href={finder.ctaPath}>{finder.ctaLabel}</TextCta>
              )}
            </div>
            <ProductCategoryCarousel
              categories={(finder.items ?? []).map((i) => ({
                title: i.heading,
                copy: i.body ?? "",
                path: i.categoryPath,
              }))}
            />
          </section>
        )}
        {faq?.enabled && <HomeFaq section={faq} />}
      </main>
      <SiteFooter />
    </>
  );
}

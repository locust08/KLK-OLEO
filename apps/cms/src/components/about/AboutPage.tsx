import {
  EditorialMedia,
  imageBackground,
} from "@/components/ui/EditorialMedia";
import { WorldMap } from "@/components/maps/WorldMap";
import type { MapPoint } from "@/lib/maps/model";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { PageContentViewModel } from "@/lib/cms/view-models";
import styles from "./AboutPage.module.css";

export function AboutPage({
  page,
  mapPoints,
}: {
  page: PageContentViewModel | null;
  mapPoints: MapPoint[];
}) {
  if (!page) return null;
  const { agriculture, brandStory, research, globalPresence } = page.content;
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section
          className={styles.hero}
          style={imageBackground(page.heroImage)}
          aria-labelledby="about-page-title"
        >
          <div className={styles.heroOverlay} />
          <h1 id="about-page-title">{page.heroHeading}</h1>
        </section>

        {agriculture?.enabled && (
          <section className={styles.agriculture}>
            <div className={styles.agricultureInner}>
              <div
                className={styles.agricultureImage}
                aria-label="Agriculture solutions imagery"
              >
                <EditorialMedia image={agriculture.image} />
              </div>
              <div className={styles.agricultureCopy} data-reveal="right">
                <p className={styles.kicker}>{agriculture.eyebrow}</p>
                <h2>{agriculture.heading}</h2>
                {agriculture.paragraphs?.map((p, i) => (
                  <p key={i}>{p.text}</p>
                ))}
              </div>
            </div>
          </section>
        )}

        {brandStory?.enabled && (
          <section
            className={styles.brandStory}
            style={imageBackground(brandStory.image)}
            aria-labelledby="brand-story-title"
          >
            <div className={styles.brandStoryInner} data-reveal="zoom">
              <p className={styles.brandLabel}>{brandStory.eyebrow}</p>
              <h2 id="brand-story-title">{brandStory.heading}</h2>
              {brandStory.paragraphs?.map((p, i) => (
                <p key={i}>
                  {i === 0 ? (
                    <>
                      <span className={styles.brandLead}>
                        {p.text.split(",")[0]},
                      </span>
                      {p.text.slice(p.text.indexOf(",") + 1)}
                    </>
                  ) : (
                    p.text
                  )}
                </p>
              ))}
            </div>
          </section>
        )}

        {research?.enabled && (
          <section className={styles.research} aria-labelledby="research-title">
            <div
              className={styles.researchGallery}
              aria-label="Research and development imagery"
            >
              {research.images?.map((item, i) => (
                <div
                  key={i}
                  className={`${styles.researchImage} ${[styles.researchImageOne, styles.researchImageTwo, styles.researchImageThree][i]}`}
                >
                  <EditorialMedia image={item.image} />
                </div>
              ))}
            </div>
            <div className={styles.researchCopy} data-reveal="right">
              <p className={styles.researchLabel}>{research.eyebrow}</p>
              <h2 id="research-title">{research.heading}</h2>
              {research.items?.map((p, i) => (
                <div className={styles.researchPoint} key={i}>
                  <h3>{p.heading}</h3>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {globalPresence?.enabled && (
          <section
            className={styles.globalPresence}
            aria-labelledby="global-presence-title"
          >
            <h2 id="global-presence-title">{globalPresence.heading}</h2>
            <WorldMap points={mapPoints} />
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}

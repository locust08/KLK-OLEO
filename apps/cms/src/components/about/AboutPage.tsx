import Image from "next/image";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { siteAssets } from "@/data/site-assets";
import type { PageContentViewModel } from "@/lib/cms/view-models";
import styles from "./AboutPage.module.css";

export function AboutPage({ page }: { page: PageContentViewModel | null }) {
  const introduction = page?.sections[0];
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero} style={{ backgroundImage: `url(${page?.heroImageUrl || siteAssets.aboutHero})` }} aria-labelledby="about-page-title">
          <div className={styles.heroOverlay} />
          <h1 id="about-page-title">{page?.heroHeading || page?.title || "About Us"}</h1>
        </section>

        <section className={styles.agriculture}>
          <div className={styles.agricultureInner}>
            <div className={styles.agricultureImage}>
              <Image src={siteAssets.agricultureSolutions} fill priority sizes="(max-width: 767px) calc(100vw - 30px), 32vw" alt="Hands holding soil and a young green plant" />
            </div>
            <div className={styles.agricultureCopy}>
              <p className={styles.kicker}>KLK Oleo Agrochemicals</p>
              <h2>{introduction?.heading || "Agriculture Solutions"}</h2>
              <p>{introduction?.body || "KLK OLEO Agrochemicals is the preferred partner for high-performing agrochemical ingredients that enhance formulation efficiency, crop health, and application effectiveness. As part of KLK OLEO, a global leader in oleochemicals, we bring the strength of an international network directly to your fields and formulation labs."}</p>
              <p>Supported by our experienced scientists, R&amp;D centres, product development capabilities and agronomist insights, we work hand-in-hand with customers to refine formulations, enhance application performance, and develop solutions that create measurable impact in the field.</p>
              <p>Sustainability is embedded in everything we do. From plant-derived ingredients, low-carbon options to innovations that reduce agrochemical use, our portfolio is designed to meet today&apos;s environmental challenges while ensuring productivity and reliability.</p>
              <p>With KLK OLEO Agrochemicals, you gain more than ingredients — you gain a partner committed to quality, consistency, and technical excellence, so you can focus on what matters most: healthy, productive crops and a sustainable future.</p>
            </div>
          </div>
        </section>

        <section className={styles.brandStory} style={{ backgroundImage: `url(${siteAssets.brandStoryBackground})` }} aria-labelledby="brand-story-title">
          <div className={styles.brandStoryInner}>
            <p className={styles.brandLabel}>Brand Story</p>
            <h2 id="brand-story-title">AIDIGRO</h2>
            <p><span className={styles.brandLead}>Our dedicated agrochemical range, Aidigro,</span> is more than a name; it&apos;s a promise. Rooted in the fusion of &lsquo;Aid&rsquo; and &lsquo;Agro&rsquo; (agriculture), our brand is a beacon to the world of farming.</p>
            <p>We are passionate to nurture and to safeguard agricultural landscapes, dedicated to empower farmers and enriching the planet. Aidigro represents quality, innovation, and a commitment to responsible, sustainable agriculture.</p>
            <p>Designed to empower formulators, our diverse agrochemical range offers both standard and customised solutions, carefully evaluated to support effective crop protection, improved performance, and reduced environmental impact.</p>
            <p>By partnering with Aidigro, you gain a trusted ally in advancing sustainable agriculture and cultivating a greener and more productive future.</p>
          </div>
        </section>

        <section className={styles.research} aria-labelledby="research-title">
          <div className={styles.researchGallery} aria-label="Research and development imagery">
            <div className={`${styles.researchImage} ${styles.researchImageOne}`}>
              <Image src={siteAssets.innovationRDCentre} fill unoptimized sizes="(max-width: 767px) 70vw, 770px" alt="KLK OLEO Research and Development Centre" />
            </div>
            <div className={`${styles.researchImage} ${styles.researchImageTwo}`}>
              <Image src={siteAssets.innovationFieldDrones} fill unoptimized sizes="(max-width: 767px) 76vw, 770px" alt="Agricultural drones applying treatments over a field" />
            </div>
            <div className={`${styles.researchImage} ${styles.researchImageThree}`}>
              <Image src={siteAssets.innovationPlantResearch} fill unoptimized sizes="(max-width: 767px) 70vw, 770px" alt="Scientist studying a plant in a laboratory" />
            </div>
          </div>
          <div className={styles.researchCopy}>
            <p className={styles.researchLabel}>Research and Development</p>
            <h2 id="research-title">Innovation from Lab to Field</h2>
            <div className={styles.researchPoint}>
              <h3>Formulations Built for the Field</h3>
              <p>At KLK OLEO, we are committed to deliver real solutions with growers to engineer complete systems that work seamlessly from the mixing tank to the field.</p>
            </div>
            <div className={styles.researchPoint}>
              <h3>Research and Development Rooted in Agronomy</h3>
              <p>Partnering with Applied Agricultural Resources (AAR), we bring crop, soil, and environmental insight directly to you to meet modern agricultural challenges.</p>
            </div>
            <div className={styles.researchPoint}>
              <h3>From Lab to Land, Research to Reality</h3>
              <p>As part of the KLK Group, we validate technologies in our own plantations—delivering proven reliability for real-world conditions.</p>
            </div>
          </div>
        </section>

        <section className={styles.globalPresence} aria-labelledby="global-presence-title">
          <h2 id="global-presence-title">KLK OLEO Global Presence</h2>
          <div className={styles.globalPresenceInner}>
            <div className={styles.globalPresenceViewport} tabIndex={0} aria-label="Scrollable KLK OLEO global presence map">
              <Image
                className={styles.globalPresenceMap}
                src={siteAssets.globalPresence}
                width={2048}
                height={1448}
                sizes="(max-width: 767px) 900px, 68vw"
                alt="World map showing KLK OLEO offices, research and development centres, production sites, operating facilities, and sales networks"
              />
            </div>
            <div className={styles.regionList} aria-label="KLK OLEO global regions">
              <details className={styles.regionPanel} open>
                <summary>South East Asia</summary>
                <div className={styles.regionPanelBody}>
                  <div className={styles.regionGroup}>
                    <h3>Malaysia</h3>
                    <ul>
                      <li>KLK Bioenergy</li>
                      <li>KL-Kepong Oleomas</li>
                      <li>Palm-Oleo</li>
                      <li>Palm-Oleo (Klang)</li>
                      <li>Stolthaven (Westport)</li>
                    </ul>
                  </div>
                  <div className={styles.regionGroup}>
                    <h3>Singapore</h3>
                    <ul><li>Davos Life Science</li></ul>
                  </div>
                  <div className={styles.regionGroup}>
                    <h3>Indonesia</h3>
                    <ul>
                      <li>KLK Dumai</li>
                      <li>Perindustrian Sawit Synergi</li>
                    </ul>
                  </div>
                </div>
              </details>
              <details className={styles.regionPanel}>
                <summary>Asia</summary>
                <div className={styles.regionPanelBody}>
                  <div className={styles.regionGroup}>
                    <h3>China</h3>
                    <ul>
                      <li>Taiko Palm-Oleo (Zhangjiagang)</li>
                      <li>KLK OLEO (Shanghai)</li>
                    </ul>
                  </div>
                  <div className={styles.regionGroup}>
                    <h3>India</h3>
                    <ul><li>KLK OLEO India</li></ul>
                  </div>
                </div>
              </details>
              <details className={styles.regionPanel}>
                <summary>Europe</summary>
                <div className={styles.regionPanelBody}>
                  <div className={styles.regionGroup}>
                    <h3>Germany</h3>
                    <ul><li>KLK Emmerich (Emmerich &amp; Düsseldorf sites)</li></ul>
                  </div>
                  <div className={styles.regionGroup}>
                    <h3>Switzerland</h3>
                    <ul><li>Kolb Distribution</li></ul>
                  </div>
                  <div className={styles.regionGroup}>
                    <h3>Netherlands</h3>
                    <ul>
                      <li>Dr. W. Kolb Nederland</li>
                      <li>KLK Kolb Specialties</li>
                    </ul>
                  </div>
                  <div className={styles.regionGroup}>
                    <h3>Belgium</h3>
                    <ul><li>KLK Tensachem</li></ul>
                  </div>
                  <div className={styles.regionGroup}>
                    <h3>Italy</h3>
                    <ul><li>KLK Temix</li></ul>
                  </div>
                </div>
              </details>
              <details className={styles.regionPanel}>
                <summary>Americas</summary>
                <div className={styles.regionPanelBody}>
                  <div className={styles.regionGroup}>
                    <h3>United States</h3>
                    <ul><li>KLK OLEO Americas</li></ul>
                  </div>
                </div>
              </details>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

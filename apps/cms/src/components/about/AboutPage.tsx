import Image from "next/image";
import { WorldMap } from "@/components/maps/WorldMap";
import type { MapPoint } from "@/lib/maps/model";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { siteAssets } from "@/data/site-assets";
import type { PageContentViewModel } from "@/lib/cms/view-models";
import styles from "./AboutPage.module.css";

export function AboutPage({ page: _page, mapPoints }: { page: PageContentViewModel | null; mapPoints: MapPoint[] }) {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero} style={{ backgroundImage: `url(${siteAssets.aboutHero})` }} aria-labelledby="about-page-title">
          <div className={styles.heroOverlay} />
          <h1 id="about-page-title">About Us</h1>
        </section>

        <section className={styles.agriculture}>
          <div className={styles.agricultureInner}>
            <div className={styles.agricultureImage} aria-label="Agriculture solutions imagery">
              <Image src={siteAssets.agricultureSolutions} fill sizes="(max-width: 767px) 100vw, 50vw" alt="Hands holding soil and a young green plant" />
            </div>
            <div className={styles.agricultureCopy} data-reveal="right">
              <p className={styles.kicker}>KLK Oleo Agrochemicals</p>
              <h2>Agriculture Solutions</h2>
              <p>KLK OLEO Agrochemicals is the preferred partner for high-performing agrochemical ingredients that enhance formulation efficiency, crop health, and application effectiveness. As part of KLK OLEO, a global leader in oleochemicals, we bring the strength of an international network directly to your fields and formulation labs.</p>
              <p>Supported by our experienced scientists, R&amp;D centres, product development capabilities and agronomist insights, we work hand-in-hand with customers to refine formulations, enhance application performance, and develop solutions that create measurable impact in the field.</p>
              <p>Sustainability is embedded in everything we do. From plant-derived ingredients, low-carbon options to innovations that reduce agrochemical use, our portfolio is designed to meet today&apos;s environmental challenges while ensuring productivity and reliability.</p>
              <p>With KLK OLEO Agrochemicals, you gain more than ingredients — you gain a partner committed to quality, consistency, and technical excellence, so you can focus on what matters most: healthy, productive crops and a sustainable future.</p>
            </div>
          </div>
        </section>

        <section className={styles.brandStory} style={{ backgroundImage: `url(${siteAssets.brandStoryBackground})` }} aria-labelledby="brand-story-title">
          <div className={styles.brandStoryInner} data-reveal="zoom">
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
              <Image src={siteAssets.innovationRDCentre} fill unoptimized sizes="(max-width: 767px) 70vw, 616px" alt="KLK OLEO Research and Development Centre" />
            </div>
            <div className={`${styles.researchImage} ${styles.researchImageTwo}`}>
              <Image src={siteAssets.innovationFieldDrones} fill unoptimized sizes="(max-width: 767px) 70vw, 616px" alt="Agricultural drones applying treatments over a field" />
            </div>
            <div className={`${styles.researchImage} ${styles.researchImageThree}`}>
              <Image src={siteAssets.innovationPlantResearch} fill unoptimized sizes="(max-width: 767px) 70vw, 616px" alt="Scientist studying a plant in a laboratory" />
            </div>
          </div>
          <div className={styles.researchCopy} data-reveal="right">
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
          <WorldMap points={mapPoints} />
        </section>

      </main>
      <SiteFooter />
    </>
  );
}

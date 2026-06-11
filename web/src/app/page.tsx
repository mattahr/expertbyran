import type { Route } from "next";
import Link from "next/link";

import { CTAButton } from "@/components/site/CTAButton";
import { RevealOnScroll } from "@/components/site/RevealOnScroll";
import { StatCounter } from "@/components/site/StatCounter";
import { GridCell } from "@/components/site/GridCell";
import styles from "@/components/site/site.module.css";
import {
  getAreasForExpert,
  getFeaturedExpertAreas,
  getFeaturedExperts,
  getOrderedSiteData,
} from "@/lib/content/query";

// Läser experter/områden ur databasen — renderas on-demand, prerendras inte vid build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getOrderedSiteData();
  const featuredAreas = await getFeaturedExpertAreas();
  const featuredExperts = await getFeaturedExperts();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <div className={styles.heroSignature}>
          <p className={styles.heroEyebrow}>{data.site.hero.eyebrow}</p>
          <h1 className={styles.heroTitle}>{data.site.hero.title}</h1>
          <div className={styles.heroLine} />
          <p className={styles.heroIntro}>{data.site.hero.intro}</p>
          <div className={styles.heroActions}>
            <CTAButton href="/experter" variant="secondary">
              Utforska experter
            </CTAButton>
            <CTAButton href="/expertomraden" variant="outline">
              Utforska områden
            </CTAButton>
          </div>
        </div>
      </div>

      <div className={styles.bento}>
        <div className={`${styles.bentoTile} ${styles.bentoTileAccent}`}>
          <span className={styles.bentoLabel}>Experter</span>
          <span className={styles.bentoStat}>
            <StatCounter value={data.experts.length} />
          </span>
          <span className={styles.bentoText}>Specialister med djup inom sina fält.</span>
        </div>
        <div className={styles.bentoTile}>
          <span className={styles.bentoLabel}>Expertområden</span>
          <span className={styles.bentoStat} style={{ color: "var(--accent)" }}>
            <StatCounter value={data.expertAreas.length} />
          </span>
          <span className={styles.bentoText}>Sammanhängande kompetensområden.</span>
        </div>
        <Link href="/marknadsplats" className={`${styles.bentoTile} ${styles.bentoTileDark} ${styles.bentoWide}`}>
          <span className={styles.bentoLabel}>Marknadsplats</span>
          <span className={styles.bentoStat} style={{ fontSize: "1.6rem" }}>
            Installera byrån som plugin
          </span>
          <span className={styles.bentoText}>
            Routa uppgifter till rätt domänexpert direkt i ditt arbetsflöde →
          </span>
        </Link>
      </div>

      <RevealOnScroll as="section" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Utvalda experter</span>
        </div>
        <div className={styles.featuredExperts}>
          {data.experts.slice(0, 3).map((expert) => (
            <article key={expert.slug} className={styles.featuredExpert}>
              <Link href={`/experter/${expert.slug}` as Route} className={styles.featuredExpertLink}>
                <div className={styles.featuredExpertPortrait} aria-hidden>
                  <span>{expert.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span>
                </div>
                <div className={styles.featuredExpertBody}>
                  <h3 className={styles.featuredExpertName}>{expert.name}</h3>
                  <p className={styles.featuredExpertRole}>{expert.role}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Expertområden</h2>
          <span className={styles.sectionCount}>{data.expertAreas.length} områden</span>
        </div>
        <div className={styles.grid}>
          {featuredAreas.map((area) => (
            <GridCell
              key={area.id}
              href={`/expertomraden/${area.slug}`}
              categoryColor={area.accent}
              name={area.name}
              description={area.shortDescription}
            />
          ))}
        </div>
      </RevealOnScroll>

      <RevealOnScroll as="section" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Experter</h2>
          <span className={styles.sectionCount}>{data.experts.length} konsulter</span>
        </div>
        <div className={styles.grid}>
          {featuredExperts.map((expert) => {
            const areas = getAreasForExpert(data, expert);
            const primaryArea = areas[0];
            return (
              <GridCell
                key={expert.id}
                href={`/experter/${expert.slug}`}
                category={expert.role}
                categoryColor={primaryArea?.accent}
                name={expert.name}
                description={expert.summary}
              />
            );
          })}
        </div>
      </RevealOnScroll>
    </div>
  );
}

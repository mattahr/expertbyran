import type { Route } from "next";
import Link from "next/link";

import { RevealOnScroll } from "@/components/site/RevealOnScroll";
import { StatCounter } from "@/components/site/StatCounter";
import { GridCell } from "@/components/site/GridCell";
import styles from "@/components/site/site.module.css";
import {
  getAreasForExpert,
  getFeaturedExpertAreas,
  getFeaturedExperts,
  getFeaturedTeams,
  getOrderedSiteData,
} from "@/lib/content/query";

export default async function HomePage() {
  const data = await getOrderedSiteData();
  const featuredAreas = await getFeaturedExpertAreas();
  const featuredTeams = await getFeaturedTeams();
  const featuredExperts = await getFeaturedExperts();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <span className={styles.heroDecoCircle} aria-hidden />
        <p className={styles.heroEyebrow}>{data.site.hero.eyebrow}</p>
        <h1 className={styles.heroTitle}>{data.site.hero.title}</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>{data.site.hero.intro}</p>
      </div>

      <div className={styles.stats}>
        <div>
          <div className={styles.statValue}>
            <StatCounter value={data.experts.length} />
          </div>
          <div className={styles.statLabel}>Experter</div>
        </div>
        <div>
          <div className={styles.statValue}>
            <StatCounter value={data.teams.length} />
          </div>
          <div className={styles.statLabel}>Team</div>
        </div>
        <div>
          <div className={styles.statValue}>
            <StatCounter value={data.expertAreas.length} />
          </div>
          <div className={styles.statLabel}>Expertområden</div>
        </div>
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
              category={area.name}
              categoryColor={area.accent}
              name={area.shortDescription}
              description=""
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

      <RevealOnScroll as="section" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Team</h2>
          <span className={styles.sectionCount}>{data.teams.length} team</span>
        </div>
        <div className={styles.grid}>
          {featuredTeams.map((team) => (
            <GridCell
              key={team.id}
              href={`/team/${team.slug}`}
              category={`${team.expertSlugs.length} medlemmar`}
              name={team.name}
              description={team.shortDescription}
            />
          ))}
        </div>
      </RevealOnScroll>
    </div>
  );
}

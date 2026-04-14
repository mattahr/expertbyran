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
          <div className={styles.statValue}>{data.experts.length}</div>
          <div className={styles.statLabel}>Experter</div>
        </div>
        <div>
          <div className={styles.statValue}>{data.teams.length}</div>
          <div className={styles.statLabel}>Team</div>
        </div>
        <div>
          <div className={styles.statValue}>{data.expertAreas.length}</div>
          <div className={styles.statLabel}>Expertområden</div>
        </div>
      </div>

      <section className={styles.section}>
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
      </section>

      <section className={styles.section}>
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
      </section>

      <section className={styles.section}>
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
      </section>
    </div>
  );
}

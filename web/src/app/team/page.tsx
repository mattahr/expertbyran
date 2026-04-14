import { GridCell } from "@/components/site/GridCell";
import { RevealOnScroll } from "@/components/site/RevealOnScroll";
import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";

export const metadata = {
  title: "Team",
};

export default async function TeamsPage() {
  const data = await getOrderedSiteData();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Kuraterade team</p>
        <h1 className={styles.heroTitle}>Team med fast expertmix.</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>
          Teamen samlar flera experter under en gemensam leveranslogik. Varje team motsvarar ett eget plugin i det externa monorepot.
        </p>
      </div>

      <RevealOnScroll as="section" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Alla team</h2>
          <span className={styles.sectionCount}>{data.teams.length} team</span>
        </div>
        <div className={styles.grid}>
          {data.teams.map((team) => (
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

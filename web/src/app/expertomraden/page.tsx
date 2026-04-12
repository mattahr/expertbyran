import { GridCell } from "@/components/site/GridCell";
import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";

export const metadata = {
  title: "Expertområden",
};

export default async function ExpertAreasPage() {
  const data = await getOrderedSiteData();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Expertområden</p>
        <h1 className={styles.heroTitle}>Expertområden med tydligt mandat.</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>
          Varje område beskriver när kompetensen används, vilka leverabler som normalt tas fram och vilka experter och team som knyts till området.
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Alla områden</h2>
          <span className={styles.sectionCount}>{data.expertAreas.length} områden</span>
        </div>
        <div className={styles.grid}>
          {data.expertAreas.map((area) => (
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
    </div>
  );
}

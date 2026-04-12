import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";

export const metadata = {
  title: "Om oss",
};

export default async function AboutPage() {
  const data = await getOrderedSiteData();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Om Expertbyrån</p>
        <h1 className={styles.heroTitle}>{data.organization.modelTitle}</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>{data.organization.summary}</p>
      </div>

      <div className={styles.stats}>
        {data.organization.operations.map((op) => (
          <div key={op.label}>
            <div className={styles.statValue}>{op.value}</div>
            <div className={styles.statLabel}>{op.label}</div>
          </div>
        ))}
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Organisation</h2>
          <span className={styles.sectionCount}>{data.organization.structure.length} funktioner</span>
        </div>
        <div className={styles.grid}>
          {data.organization.structure.map((item) => (
            <div key={item.id} className={styles.gridCell}>
              <span className={styles.gridCellCategory}>Funktion</span>
              <span className={styles.gridCellName}>{item.title}</span>
              <span className={styles.gridCellDesc}>{item.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Arbetssätt</h2>
        </div>
        <div className={styles.grid}>
          {data.organization.workflow.map((step, index) => (
            <div key={step.title} className={styles.gridCell}>
              <span className={styles.gridCellCategory}>Steg {index + 1}</span>
              <span className={styles.gridCellName}>{step.title}</span>
              <span className={styles.gridCellDesc}>{step.description}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { PageHero } from "@/components/site/PageHero";
import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";

export const metadata = {
  title: "Om oss",
};

export default async function AboutPage() {
  const data = await getOrderedSiteData();

  return (
    <div className={styles.pageWrap}>
      <PageHero
        eyebrow="Om Expertbyrån"
        title={data.organization.modelTitle}
        intro={data.organization.summary}
        primaryAction={{ href: "/expertomraden", label: "Se expertområden" }}
        secondaryAction={{ href: "/", label: "Till startsidan" }}
        asideLabel="Leveransmodell"
        asideValue={data.organization.modelDescription}
      />

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Organisation</p>
            <h2 className={styles.sectionTitle}>Tydliga roller i en helt virtuell byrå.</h2>
          </div>
        </div>
        <div className={styles.gridCards}>
          {data.organization.structure.map((item) => (
            <article key={item.id} className={styles.card}>
              <p className={styles.cardMeta}>Funktion</p>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardText}>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.twoColumn}>
          <div className={styles.detailBlock}>
            <p className={styles.eyebrow}>Hur vi arbetar</p>
            <h2 className={styles.sectionTitle}>Från analys till kvalitetssäkrad leverans.</h2>
            <p className={styles.sectionText}>{data.organization.modelDescription}</p>
          </div>

          <ul className={styles.metricList}>
            {data.organization.operations.map((operation) => (
              <li key={operation.label} className={styles.metricItem}>
                <span className={styles.metricValue}>{operation.value}</span>
                <span className={styles.metricLabel}>{operation.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

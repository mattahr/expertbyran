import { RevealOnScroll } from "@/components/site/RevealOnScroll";
import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";

export const metadata = {
  title: "Marknadsplats",
};

export default async function MarketplacePage() {
  const data = await getOrderedSiteData();
  const { experts, teams } = data;

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Marknadsplats</p>
        <h1 className={styles.heroTitle}>{data.marketplace.name}</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>{data.marketplace.description}</p>
      </div>

      <RevealOnScroll as="section" className={styles.section}>
        <div className={styles.detailLayout}>
          <div className={styles.detailSidebar}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>GitHub</span>
              <a href={data.marketplace.repositoryUrl} className={styles.textLink}>
                {data.marketplace.installSource.source === "github"
                  ? data.marketplace.installSource.repo
                  : data.marketplace.repositoryUrl}
              </a>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Publicerade plugins</span>
              <span className={styles.metaValue}>{experts.length + teams.length}</span>
            </div>
          </div>

          <div className={styles.detailMain}>
            <h2 className={styles.detailHeading}>Installation</h2>
            <pre className={styles.codeBlock}>{`/plugin marketplace add ${
              data.marketplace.installSource.source === "github"
                ? data.marketplace.installSource.repo
                : data.marketplace.name
            }`}</pre>
          </div>
        </div>
      </RevealOnScroll>

      {experts.length > 0 && (
        <RevealOnScroll as="section" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>Publicerade experter</h2>
            <span className={styles.sectionCount}>{experts.length} experter</span>
          </div>
          <div className={styles.grid}>
            {experts.map((expert) => (
              <div key={expert.id} className={styles.gridCell}>
                <span className={styles.gridCellCategory}>{expert.role}</span>
                <span className={styles.gridCellName}>{expert.name}</span>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      )}

      {teams.length > 0 && (
        <RevealOnScroll as="section" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>Publicerade team</h2>
            <span className={styles.sectionCount}>{teams.length} team</span>
          </div>
          <div className={styles.grid}>
            {teams.map((team) => (
              <div key={team.id} className={styles.gridCell}>
                <span className={styles.gridCellName}>{team.name}</span>
                <span className={styles.gridCellDesc}>{team.shortDescription}</span>
              </div>
            ))}
          </div>
        </RevealOnScroll>
      )}
    </div>
  );
}

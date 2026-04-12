import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";

export const metadata = {
  title: "Marknadsplats",
};

export default async function MarketplacePage() {
  const data = await getOrderedSiteData();
  const listedExperts = data.experts.filter((e) => e.plugin.marketplaceListed);
  const listedTeams = data.teams.filter((t) => t.plugin.marketplaceListed);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Marknadsplats</p>
        <h1 className={styles.heroTitle}>{data.marketplace.name}</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>{data.marketplace.description}</p>
      </div>

      <section className={styles.section}>
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
              <span className={styles.metaValue}>{listedExperts.length + listedTeams.length}</span>
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
      </section>

      {listedExperts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>Publicerade experter</h2>
            <span className={styles.sectionCount}>{listedExperts.length} skills</span>
          </div>
          <div className={styles.grid}>
            {listedExperts.map((expert) => (
              <div key={expert.id} className={styles.gridCell}>
                <span className={styles.gridCellCategory}>{expert.plugin.name}</span>
                <span className={styles.gridCellName}>{expert.name}</span>
                <span className={styles.gridCellDesc}>v{expert.plugin.version}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {listedTeams.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>Publicerade team</h2>
            <span className={styles.sectionCount}>{listedTeams.length} skills</span>
          </div>
          <div className={styles.grid}>
            {listedTeams.map((team) => (
              <div key={team.id} className={styles.gridCell}>
                <span className={styles.gridCellCategory}>{team.plugin.name}</span>
                <span className={styles.gridCellName}>{team.name}</span>
                <span className={styles.gridCellDesc}>v{team.plugin.version}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

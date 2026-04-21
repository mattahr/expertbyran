import styles from "@/components/site/site.module.css";
import logStyles from "./log.module.css";
import { readAllVisits, type VisitEntry } from "@/lib/storage/visit-log";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Besökslogg",
  robots: { index: false, follow: false },
};

function aggregate(visits: VisitEntry[]) {
  const uniqueIps = new Set(visits.map((v) => v.ip || "okänd"));
  const pageCounts = new Map<string, number>();
  const refererCounts = new Map<string, number>();
  const dayCounts = new Map<string, number>();

  for (const v of visits) {
    pageCounts.set(v.path, (pageCounts.get(v.path) ?? 0) + 1);

    if (v.referer) {
      try {
        const host = new URL(v.referer).hostname;
        refererCounts.set(host, (refererCounts.get(host) ?? 0) + 1);
      } catch {
        refererCounts.set(v.referer, (refererCounts.get(v.referer) ?? 0) + 1);
      }
    }

    const day = v.timestamp.slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
  }

  const topPages = [...pageCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topReferers = [...refererCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const perDay = [...dayCounts.entries()].sort((a, b) => b[0].localeCompare(a[0]));

  return { uniqueIps: uniqueIps.size, topPages, topReferers, perDay };
}

export default async function LogPage() {
  const visits = await readAllVisits(30);
  const stats = aggregate(visits);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Intern</p>
        <h1 className={styles.heroTitle}>Besökslogg</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>
          Senaste 30 dagars besöksstatistik.
        </p>
      </div>

      {/* Sammanställda nyckeltal */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Sammanfattning</h2>
        </div>
        <div className={logStyles.statsGrid}>
          <div className={logStyles.statCard}>
            <div className={logStyles.statLabel}>Totalt besök</div>
            <div className={logStyles.statValue}>{visits.length}</div>
          </div>
          <div className={logStyles.statCard}>
            <div className={logStyles.statLabel}>Unika besökare</div>
            <div className={logStyles.statValue}>{stats.uniqueIps}</div>
          </div>
          <div className={logStyles.statCard}>
            <div className={logStyles.statLabel}>Dagar med data</div>
            <div className={logStyles.statValue}>{stats.perDay.length}</div>
          </div>
          <div className={logStyles.statCard}>
            <div className={logStyles.statLabel}>Snitt/dag</div>
            <div className={logStyles.statValue}>
              {stats.perDay.length > 0
                ? Math.round(visits.length / stats.perDay.length)
                : 0}
            </div>
          </div>
        </div>
      </section>

      {/* Toppsidor och referrers */}
      <section className={styles.section}>
        <div className={logStyles.columns}>
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionLabel}>Populäraste sidor</h2>
            </div>
            <ul className={logStyles.rankList}>
              {stats.topPages.map(([path, count]) => (
                <li key={path} className={logStyles.rankItem}>
                  <span>{path}</span>
                  <span className={logStyles.rankCount}>{count}</span>
                </li>
              ))}
              {stats.topPages.length === 0 && (
                <li className={logStyles.rankItem}>Ingen data ännu</li>
              )}
            </ul>
          </div>
          <div>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionLabel}>Trafikkällor</h2>
            </div>
            <ul className={logStyles.rankList}>
              {stats.topReferers.map(([host, count]) => (
                <li key={host} className={logStyles.rankItem}>
                  <span>{host}</span>
                  <span className={logStyles.rankCount}>{count}</span>
                </li>
              ))}
              {stats.topReferers.length === 0 && (
                <li className={logStyles.rankItem}>Ingen data ännu</li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Besök per dag */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Besök per dag</h2>
        </div>
        <table className={logStyles.table}>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Besök</th>
            </tr>
          </thead>
          <tbody>
            {stats.perDay.map(([day, count]) => (
              <tr key={day}>
                <td>{day}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Senaste individuella besök */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Senaste besök</h2>
          <span className={styles.sectionCount}>{Math.min(visits.length, 100)} av {visits.length}</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className={logStyles.table}>
            <thead>
              <tr>
                <th>Tid</th>
                <th>Sida</th>
                <th>IP</th>
                <th>Referer</th>
                <th>User-Agent</th>
                <th>Språk</th>
              </tr>
            </thead>
            <tbody>
              {visits
                .slice()
                .reverse()
                .slice(0, 100)
                .map((v, i) => (
                  <tr key={i}>
                    <td>{new Date(v.timestamp).toLocaleString("sv-SE")}</td>
                    <td>{v.path}</td>
                    <td>{v.ip || "—"}</td>
                    <td>{v.referer || "—"}</td>
                    <td>{v.userAgent}</td>
                    <td>{v.lang || "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

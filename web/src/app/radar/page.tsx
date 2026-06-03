import type { Route } from "next";
import Link from "next/link";

import styles from "@/components/site/site.module.css";
import { Pill } from "@/components/site/Pill";
import { formatRadarDate, getRadarArchive } from "@/lib/radar/query";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Radar",
  description: "Expertbyråns tech-radar — teknik och regelverk som påverkar offentlig granskning.",
};

export default async function RadarListPage() {
  const radars = await getRadarArchive();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Radar</p>
        <h1 className={styles.heroTitle}>Tech-radar.</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>
          Kuraterade foresight-signaler placerade efter redaktionell hållning och tema — teknik och regelverk som påverkar offentlig granskning.
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Radarer</h2>
          <span className={styles.sectionCount}>{`${radars.length} radarer`}</span>
        </div>

        {radars.length === 0 ? (
          <div className={styles.emptyState}>Inga radarer publicerade ännu.</div>
        ) : (
          <div className={styles.blogGrid}>
            {radars.map((radar) => (
              <Link key={radar.slug} href={`/radar/${radar.slug}` as Route} className={styles.blogCard}>
                <div className={styles.blogPostMeta}>
                  <Pill variant="marine">{formatRadarDate(radar.date)}</Pill>
                  {radar.version ? <Pill variant="neutral">{`Version ${radar.version}`}</Pill> : null}
                </div>
                <h3 className={styles.blogCardTitle}>{radar.title}</h3>
                {radar.subtitle ? <p className={styles.blogCardSummary}>{radar.subtitle}</p> : null}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

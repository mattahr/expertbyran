import type { Route } from "next";
import Link from "next/link";

import styles from "@/components/site/site.module.css";
import { Pill } from "@/components/site/Pill";
import { formatForesightDate, getForesightArchive } from "@/lib/foresight/query";
import type { ForesightSummary } from "@/lib/foresight/query";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Foresight",
  description: "Strategisk framsyn från Expertbyrån — scenarier och implikationer för offentlig sektor.",
};

function ForesightMeta({ foresight }: { foresight: ForesightSummary }) {
  return (
    <div className={styles.blogPostMeta}>
      <Pill variant="marine">{formatForesightDate(foresight.date)}</Pill>
      {foresight.horizon ? <Pill variant="neutral">{foresight.horizon}</Pill> : null}
      <div className={styles.blogAreaPills}>
        {foresight.areas.map((area) => (
          <span key={area.slug} className={styles.blogAreaPill}>
            <span className={styles.dot} style={{ background: area.accent }} aria-hidden />
            {area.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function ForesightListPage() {
  const { foresights } = await getForesightArchive();
  const [featured, ...rest] = foresights;

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Foresight</p>
        <h1 className={styles.heroTitle}>Strategisk framsyn.</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>
          Scenarier, drivkrafter och implikationer för offentlig sektor — kuraterad framsyn kopplad till våra expertområden.
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Alla foresights</h2>
          <span className={styles.sectionCount}>{`${foresights.length} foresights`}</span>
        </div>

        {foresights.length === 0 ? (
          <div className={styles.emptyState}>Inga foresights publicerade ännu.</div>
        ) : (
          <>
            {featured ? (
              <Link href={`/foresight/${featured.slug}` as Route} className={styles.blogFeatured}>
                <ForesightMeta foresight={featured} />
                <h2 className={styles.blogFeaturedTitle}>{featured.title}</h2>
                {featured.excerpt ? <p className={styles.blogFeaturedSummary}>{featured.excerpt}</p> : null}
                <span className={styles.blogFeaturedReadMore}>Läs analysen →</span>
              </Link>
            ) : null}

            <div className={styles.blogGrid}>
              {rest.map((foresight) => (
                <Link key={foresight.slug} href={`/foresight/${foresight.slug}` as Route} className={styles.blogCard}>
                  <ForesightMeta foresight={foresight} />
                  <h3 className={styles.blogCardTitle}>{foresight.title}</h3>
                  {foresight.excerpt ? <p className={styles.blogCardSummary}>{foresight.excerpt}</p> : null}
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

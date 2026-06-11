import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Pagination } from "@/components/site/Pagination";
import styles from "@/components/site/site.module.css";
import { Pill } from "@/components/site/Pill";
import { formatForesightDate, getForesightArchivePage } from "@/lib/foresight/query";
import type { ForesightSummary } from "@/lib/foresight/query";

// Allt innehåll renderas on-demand mot datacachen — inget prerendras vid build.
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

type ForesightSearchParams = { sida?: string | string[] };

type ForesightListPageProps = {
  searchParams?: Promise<ForesightSearchParams>;
};

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
}

export default async function ForesightListPage({ searchParams }: ForesightListPageProps = {}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const { foresights, total, totalPages, page } = await getForesightArchivePage(
    parsePage(resolvedSearchParams.sida),
  );
  // ?sida= bortom sista sidan: riktig 404 i stället för vilseledande tomläge.
  if (page > totalPages) notFound();
  // Featured-layouten visas bara överst på första sidan.
  const [featured, ...rest] = page === 1 ? foresights : [null, ...foresights];

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
          <span className={styles.sectionCount}>
            {totalPages > 1 ? `${total} foresights — sida ${page} av ${totalPages}` : `${total} foresights`}
          </span>
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
              {rest
                .filter((foresight): foresight is ForesightSummary => foresight !== null)
                .map((foresight) => (
                  <Link key={foresight.slug} href={`/foresight/${foresight.slug}` as Route} className={styles.blogCard}>
                    <ForesightMeta foresight={foresight} />
                    <h3 className={styles.blogCardTitle}>{foresight.title}</h3>
                    {foresight.excerpt ? <p className={styles.blogCardSummary}>{foresight.excerpt}</p> : null}
                  </Link>
                ))}
            </div>
          </>
        )}

        <Pagination basePath="/foresight" page={page} totalPages={totalPages} />
      </section>
    </div>
  );
}

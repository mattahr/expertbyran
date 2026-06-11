import type { Route } from "next";
import Link from "next/link";

import { Pagination } from "@/components/site/Pagination";
import { Pill } from "@/components/site/Pill";
import styles from "@/components/site/site.module.css";
import { formatBlogDate, getBlogArchivePage } from "@/lib/blog/query";
import type { BlogPostSummary } from "@/lib/blog/query";
import type { ExpertArea } from "@/lib/content/schema";

// Allt innehåll renderas on-demand mot datacachen — inget prerendras vid
// build (tom databas vid nyinstallation; jfr c4c242f).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blogg",
  description: "Analyser och insikter från Expertbyråns konsulter.",
};

type BlogSearchParams = {
  omrade?: string | string[];
  sida?: string | string[];
};

type BlogPageProps = {
  searchParams?: Promise<BlogSearchParams>;
};

function toArray(value: string | string[] | undefined): string[] {
  return Array.isArray(value) ? value : value ? [value] : [];
}

function parsePage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "1", 10);
  return Number.isNaN(parsed) ? 1 : Math.max(1, parsed);
}

function buildAreaFilterHref(areaSlug: string, selectedAreaSlugs: string[], availableAreas: ExpertArea[]) {
  const selected = new Set(selectedAreaSlugs);

  if (selected.has(areaSlug)) {
    selected.delete(areaSlug);
  } else {
    selected.add(areaSlug);
  }

  const params = new URLSearchParams();
  availableAreas.forEach((area) => {
    if (selected.has(area.slug)) {
      params.append("omrade", area.slug);
    }
  });

  const query = params.toString();
  return query ? `/blogg?${query}` : "/blogg";
}

function BlogAreaPills({ areas }: { areas: ExpertArea[] }) {
  if (areas.length === 0) return null;

  return (
    <div className={styles.blogAreaPills}>
      {areas.map((area) => (
        <span key={area.slug} className={styles.blogAreaPill}>
          <span className={styles.dot} style={{ background: area.accent }} aria-hidden />
          {area.name}
        </span>
      ))}
    </div>
  );
}

function BlogPostCardMeta({ post }: { post: BlogPostSummary }) {
  return (
    <div className={styles.blogPostMeta}>
      <Pill variant="marine">{formatBlogDate(post.date)}</Pill>
      <BlogAreaPills areas={post.areas} />
    </div>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps = {}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedAreaSlugs = toArray(resolvedSearchParams.omrade);
  const requestedPage = parsePage(resolvedSearchParams.sida);

  const { posts, areas, selectedAreaSlugs, total, totalPages, page } = await getBlogArchivePage(
    requestedPage,
    requestedAreaSlugs,
  );
  const selectedAreaSlugSet = new Set(selectedAreaSlugs);
  const isFiltered = selectedAreaSlugs.length > 0;

  // Featured-layouten visas bara överst i det ofiltrerade arkivet.
  const [featured, ...rest] = !isFiltered && page === 1 ? posts : [null, ...posts];

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Blogg</p>
        <h1 className={styles.heroTitle}>Insikter och analyser.</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>
          Inlägg från Expertbyråns konsulter — korta analyser, metodreflektioner och omvärldsbevakning kopplat till våra expertområden.
        </p>
      </div>

      {areas.length > 0 ? (
        <nav className={styles.blogFilters} aria-label="Expertområden">
          <Link
            href="/blogg"
            className={
              isFiltered
                ? styles.blogFilterPill
                : `${styles.blogFilterPill} ${styles.blogFilterPillActive}`
            }
            aria-current={isFiltered ? undefined : "page"}
          >
            Visa alla
          </Link>
          {areas.map((area) => {
            const active = selectedAreaSlugSet.has(area.slug);
            return (
              <Link
                key={area.slug}
                href={buildAreaFilterHref(area.slug, selectedAreaSlugs, areas) as Route}
                className={
                  active
                    ? `${styles.blogFilterPill} ${styles.blogFilterPillActive}`
                    : styles.blogFilterPill
                }
                aria-label={active ? `${area.name}, valt` : area.name}
              >
                <span className={styles.dot} style={{ background: area.accent }} aria-hidden />
                {area.name}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>{isFiltered ? "Matchande inlägg" : "Alla inlägg"}</h2>
          <span className={styles.sectionCount}>
            {totalPages > 1
              ? `${total} inlägg — sida ${page} av ${totalPages}`
              : `${total} inlägg`}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            {isFiltered ? "Inga inlägg matchar valda expertområden." : "Inga inlägg publicerade ännu."}
          </div>
        ) : (
          <>
            {featured ? (
              <Link href={`/blogg/${featured.slug}` as Route} className={styles.blogFeatured}>
                <BlogPostCardMeta post={featured} />
                <h2 className={styles.blogFeaturedTitle}>{featured.title}</h2>
                {featured.excerpt ? <p className={styles.blogFeaturedSummary}>{featured.excerpt}</p> : null}
                <span className={styles.blogFeaturedReadMore}>Läs artikeln →</span>
              </Link>
            ) : null}

            <div className={styles.blogGrid}>
              {rest
                .filter((post): post is BlogPostSummary => post !== null)
                .map((post) => (
                  <Link key={post.slug} href={`/blogg/${post.slug}` as Route} className={styles.blogCard}>
                    <BlogPostCardMeta post={post} />
                    <h3 className={styles.blogCardTitle}>{post.title}</h3>
                    {post.excerpt ? <p className={styles.blogCardSummary}>{post.excerpt}</p> : null}
                  </Link>
                ))}
            </div>
          </>
        )}

        <Pagination
          basePath="/blogg"
          page={page}
          totalPages={totalPages}
          extraParams={selectedAreaSlugs.map((slug) => ["omrade", slug] as [string, string])}
        />
      </section>
    </div>
  );
}

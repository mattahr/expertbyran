import type { Route } from "next";
import Link from "next/link";

import { Pill } from "@/components/site/Pill";
import styles from "@/components/site/site.module.css";
import { formatBlogDate, getBlogArchive } from "@/lib/blog/query";
import type { BlogPostSummary } from "@/lib/blog/query";
import type { ExpertArea } from "@/lib/content/schema";

export const metadata = {
  title: "Blogg",
  description: "Analyser och insikter från Expertbyråns konsulter.",
};

type BlogSearchParams = {
  omrade?: string | string[];
};

type BlogPageProps = {
  searchParams?: Promise<BlogSearchParams>;
};

function normalizeSelectedAreaSlugs(value: string | string[] | undefined, availableAreas: ExpertArea[]) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  const availableSlugs = new Set(availableAreas.map((area) => area.slug));
  const seen = new Set<string>();

  return values.filter((slug) => {
    if (!availableSlugs.has(slug) || seen.has(slug)) {
      return false;
    }

    seen.add(slug);
    return true;
  });
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
  const emptySearchParams: BlogSearchParams = {};
  const [{ posts, areas }, resolvedSearchParams] = await Promise.all([
    getBlogArchive(),
    searchParams ?? Promise.resolve(emptySearchParams),
  ]);
  const selectedAreaSlugs = normalizeSelectedAreaSlugs(resolvedSearchParams.omrade, areas);
  const selectedAreaSlugSet = new Set(selectedAreaSlugs);
  const visiblePosts =
    selectedAreaSlugs.length > 0
      ? posts.filter((post) => post.areaSlugs.some((slug) => selectedAreaSlugSet.has(slug)))
      : posts;
  const [featured, ...rest] = visiblePosts;
  const isFiltered = selectedAreaSlugs.length > 0;

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
            {isFiltered ? `${visiblePosts.length} av ${posts.length} inlägg` : `${posts.length} inlägg`}
          </span>
        </div>

        {visiblePosts.length === 0 ? (
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
              {rest.map((post) => (
                <Link key={post.slug} href={`/blogg/${post.slug}` as Route} className={styles.blogCard}>
                  <BlogPostCardMeta post={post} />
                  <h3 className={styles.blogCardTitle}>{post.title}</h3>
                  {post.excerpt ? <p className={styles.blogCardSummary}>{post.excerpt}</p> : null}
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

import type { Route } from "next";
import Link from "next/link";

import { Pill } from "@/components/site/Pill";
import styles from "@/components/site/site.module.css";
import { formatBlogDate, getOrderedBlogPosts } from "@/lib/blog/query";

export const metadata = {
  title: "Blogg",
  description: "Analyser och insikter från Expertbyråns konsulter.",
};

export default async function BlogPage() {
  const posts = await getOrderedBlogPosts();
  const [featured, ...rest] = posts;

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

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Alla inlägg</h2>
          <span className={styles.sectionCount}>{posts.length} inlägg</span>
        </div>

        {posts.length === 0 ? (
          <div className={styles.emptyState}>Inga inlägg publicerade ännu.</div>
        ) : (
          <>
            {featured ? (
              <Link href={`/blogg/${featured.slug}` as Route} className={styles.blogFeatured}>
                <div className={styles.blogFeaturedMeta}>
                  <Pill variant="marine">{formatBlogDate(featured.date)}</Pill>
                </div>
                <h2 className={styles.blogFeaturedTitle}>{featured.title}</h2>
                {featured.excerpt ? <p className={styles.blogFeaturedSummary}>{featured.excerpt}</p> : null}
                <span className={styles.blogFeaturedReadMore}>Läs artikeln →</span>
              </Link>
            ) : null}

            <div className={styles.blogGrid}>
              {rest.map((post) => (
                <Link key={post.slug} href={`/blogg/${post.slug}` as Route} className={styles.blogCard}>
                  <Pill variant="marine">{formatBlogDate(post.date)}</Pill>
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

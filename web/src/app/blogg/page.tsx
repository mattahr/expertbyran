import { GridCell } from "@/components/site/GridCell";
import styles from "@/components/site/site.module.css";
import { formatBlogDate, getOrderedBlogPosts } from "@/lib/blog/query";

export const metadata = {
  title: "Blogg",
  description: "Analyser och insikter från Expertbyråns konsulter.",
};

export default async function BlogPage() {
  const posts = await getOrderedBlogPosts();

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
        {posts.length > 0 ? (
          <div className={styles.grid}>
            {posts.map((post) => (
              <GridCell
                key={post.slug}
                href={`/blogg/${post.slug}`}
                category={`${formatBlogDate(post.date)} · ${post.author.name}`}
                categoryColor={post.areas[0]?.accent}
                name={post.title}
                description={post.excerpt}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>Inga inlägg publicerade ännu.</div>
        )}
      </section>
    </div>
  );
}

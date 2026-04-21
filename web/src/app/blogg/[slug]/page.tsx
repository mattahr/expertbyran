import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/components/site/site.module.css";
import { Pill } from "@/components/site/Pill";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { formatBlogDate, getBlogPost } from "@/lib/blog/query";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "Inlägg saknas" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Innehållet är betrodda markdown-filer från repot (inte användargenererat).
  // Renderad server-side med marked — ingen XSS-risk.
  return (
    <div className={styles.pageWrap}>
      <ReadingProgress />
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Blogg</p>
        <div className={styles.blogMeta}>
          <Pill variant="marine">{formatBlogDate(post.date)}</Pill>
          <Pill variant="neutral">{post.author.name}</Pill>
        </div>
        <h1 className={styles.blogTitle}>{post.title}</h1>
        <div className={styles.heroLine} />
      </div>

      <section className={styles.section}>
        <div className={styles.detailLayout}>
          <aside className={styles.detailSidebar}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Datum</span>
              <span className={styles.metaValue}>{formatBlogDate(post.date)}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Författare</span>
              <span className={styles.metaValue}>
                {post.author.expertSlug ? (
                  <Link href={`/experter/${post.author.expertSlug}`} className={styles.textLink}>
                    {post.author.name}
                  </Link>
                ) : (
                  post.author.name
                )}
              </span>
            </div>
            {post.author.role ? (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Roll</span>
                <span className={styles.metaValue}>{post.author.role}</span>
              </div>
            ) : null}
            {post.areas.map((area) => (
              <div key={area.slug} className={styles.metaRow}>
                <span className={styles.metaLabel}>Expertområde</span>
                <span className={styles.metaValue}>
                  <span className={styles.dot} style={{ background: area.accent }} aria-hidden />
                  <Link href={`/expertomraden/${area.slug}`} className={styles.textLink}>
                    {area.name}
                  </Link>
                </span>
              </div>
            ))}
          </aside>

          <div className={styles.detailMain}>
            <div
              className={styles.blogContent}
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

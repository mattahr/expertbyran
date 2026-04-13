import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/components/site/site.module.css";
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
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Blogg</p>
        <h1 className={styles.heroTitle}>{post.title}</h1>
        <div className={styles.heroLine} />
        <p className={styles.blogDate}>{formatBlogDate(post.date)}</p>
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
                <Link href={`/experter/${post.author.slug}`} className={styles.textLink}>
                  {post.author.name}
                </Link>
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Roll</span>
              <span className={styles.metaValue}>{post.author.role}</span>
            </div>
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

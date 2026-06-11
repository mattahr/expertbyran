import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/components/site/site.module.css";
import { Pill } from "@/components/site/Pill";
import { ReadingProgress } from "@/components/site/ReadingProgress";
import { formatForesightDate, getForesight } from "@/lib/foresight/query";

// Renderas on-demand mot datacachen (per-slug); inget prerendras vid build.
export const dynamic = "force-dynamic";

type ForesightPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ForesightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const foresight = await getForesight(slug);
  if (!foresight) return { title: "Foresight saknas" };
  return { title: foresight.title, description: foresight.excerpt };
}

export default async function ForesightPage({ params }: ForesightPageProps) {
  const { slug } = await params;
  const foresight = await getForesight(slug);
  if (!foresight) notFound();

  return (
    <div className={styles.pageWrap}>
      <ReadingProgress />
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Foresight</p>
        <div className={styles.blogMeta}>
          <Pill variant="marine">{formatForesightDate(foresight.date)}</Pill>
          <Pill variant="neutral">{foresight.author.name}</Pill>
        </div>
        <h1 className={styles.blogTitle}>{foresight.title}</h1>
        <div className={styles.heroLine} />
      </div>

      <section className={styles.section}>
        <div className={styles.detailLayout}>
          <aside className={styles.detailSidebar}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Datum</span>
              <span className={styles.metaValue}>{formatForesightDate(foresight.date)}</span>
            </div>
            {foresight.horizon ? (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Horisont</span>
                <span className={styles.metaValue}>{foresight.horizon}</span>
              </div>
            ) : null}
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Författare</span>
              <span className={styles.metaValue}>
                {foresight.author.expertSlug ? (
                  <Link href={`/experter/${foresight.author.expertSlug}`} className={styles.textLink}>
                    {foresight.author.name}
                  </Link>
                ) : (
                  foresight.author.name
                )}
              </span>
            </div>
            {foresight.author.role ? (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Roll</span>
                <span className={styles.metaValue}>{foresight.author.role}</span>
              </div>
            ) : null}
            {foresight.areas.map((area) => (
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
            {/* Innehållet är betrodda markdown-filer från repot (inte användargenererat).
                Renderad server-side med marked — ingen XSS-risk. */}
            <div
              className={styles.blogContent}
              dangerouslySetInnerHTML={{ __html: foresight.contentHtml }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

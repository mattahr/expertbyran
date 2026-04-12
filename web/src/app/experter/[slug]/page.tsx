import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/components/site/site.module.css";
import { getAreasForExpert, getOrderedSiteData, getTeamsForExpert } from "@/lib/content/query";

type ExpertPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ExpertPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getOrderedSiteData();
  const expert = data.experts.find((candidate) => candidate.slug === slug);

  if (!expert) {
    return { title: "Expert saknas" };
  }

  return {
    title: expert.name,
    description: expert.summary,
  };
}

export default async function ExpertDetailPage({ params }: ExpertPageProps) {
  const { slug } = await params;
  const data = await getOrderedSiteData();
  const expert = data.experts.find((candidate) => candidate.slug === slug);

  if (!expert) {
    notFound();
  }

  const areas = getAreasForExpert(data, expert);
  const teams = getTeamsForExpert(data, expert.slug);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Expertprofil</p>
        <h1 className={styles.heroTitle}>{expert.name}</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>{expert.summary}</p>
      </div>

      <section className={styles.section}>
        <div className={styles.detailLayout}>
          <aside className={styles.detailSidebar}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Roll</span>
              <span className={styles.metaValue}>{expert.role}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Plats</span>
              <span className={styles.metaValue}>{expert.location}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Tillgänglighet</span>
              <span className={styles.metaValue}>{expert.availability}</span>
            </div>
            {areas.map((area) => (
              <div key={area.slug} className={styles.metaRow}>
                <span className={styles.metaLabel}>Expertområde</span>
                <span className={styles.metaValue}>
                  <span className={styles.dot} style={{ background: area.accent }} aria-hidden />
                  <Link href={`/expertomraden/${area.slug}`} className={styles.textLink}>{area.name}</Link>
                </span>
              </div>
            ))}
            {teams.map((team) => (
              <div key={team.slug} className={styles.metaRow}>
                <span className={styles.metaLabel}>Team</span>
                <span className={styles.metaValue}>
                  <Link href={`/team/${team.slug}`} className={styles.textLink}>{team.name}</Link>
                </span>
              </div>
            ))}
            {expert.metrics.map((metric) => (
              <div key={metric.label} className={styles.metaRow}>
                <span className={styles.metaLabel}>{metric.label}</span>
                <span className={styles.metaValue}>{metric.value}</span>
              </div>
            ))}
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Skill</span>
              <span className={styles.metaValueMono}>{expert.plugin.name} v{expert.plugin.version}</span>
            </div>
          </aside>

          <div className={styles.detailMain}>
            <h2 className={styles.detailHeading}>Fokusområden</h2>
            <ul className={styles.simpleList}>
              {expert.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>

            <div className={styles.timelineSection}>
              <p className={styles.quote}>{expert.profileQuote}</p>
            </div>

            <div className={styles.timelineSection}>
              <p className={styles.timelineSectionLabel}>Utvalda uppdrag</p>
              {expert.selectedEngagements.map((engagement) => (
                <div key={engagement.title} className={styles.timelineItem}>
                  <span className={styles.timelinePeriod}>{engagement.client} · {engagement.period}</span>
                  <p className={styles.timelineTitle}>{engagement.title}</p>
                  <p className={styles.timelineText}>{engagement.summary}</p>
                </div>
              ))}
            </div>

            <div className={styles.timelineSection}>
              <p className={styles.timelineSectionLabel}>Erfarenhet</p>
              {expert.experience.map((item) => (
                <div key={`${item.organization}-${item.title}`} className={styles.timelineItem}>
                  <span className={styles.timelinePeriod}>{item.organization} · {item.period}</span>
                  <p className={styles.timelineTitle}>{item.title}</p>
                  <p className={styles.timelineText}>{item.summary}</p>
                </div>
              ))}
            </div>

            <div className={styles.twoCol}>
              <div>
                <p className={styles.twoColLabel}>Kunskap</p>
                <ul className={styles.simpleList}>
                  {expert.knowledge.map((k) => (
                    <li key={k}>{k}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={styles.twoColLabel}>Förmågor</p>
                <ul className={styles.simpleList}>
                  {expert.capabilities.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.twoCol}>
              <div>
                <p className={styles.twoColLabel}>Verktyg</p>
                <ul className={styles.inlineList}>
                  {expert.tools.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className={styles.twoColLabel}>Metoder</p>
                <ul className={styles.inlineList}>
                  {expert.methods.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

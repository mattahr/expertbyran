import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/site/PageHero";
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
    return {
      title: "Expert saknas",
    };
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
      <PageHero
        eyebrow="Expertprofil"
        title={expert.name}
        intro={expert.summary}
        primaryAction={{ href: "/marknadsplats", label: "Se marknadsplats" }}
        secondaryAction={{ href: "/expertomraden", label: "Alla expertområden" }}
        asideLabel="Tillgänglighet"
        asideValue={expert.availability}
      />

      <section className={styles.section}>
        <div className={styles.detailColumns}>
          <aside className={styles.stickyColumn}>
            <div className={styles.detailBlock}>
              <div className={styles.expertMeta}>
                <p className={styles.cardMeta}>{expert.role}</p>
                <p className={styles.expertRole}>{expert.location}</p>
              </div>

              <ul className={styles.pillList}>
                {areas.map((area) => (
                  <li key={area.slug} className={styles.pill}>
                    {area.name}
                  </li>
                ))}
              </ul>

              {teams.length ? (
                <ul className={styles.pillList}>
                  {teams.map((team) => (
                    <li key={team.slug} className={styles.pill}>
                      {team.name}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <ul className={styles.metricList}>
              {expert.metrics.map((metric) => (
                <li key={metric.label} className={styles.metricItem}>
                  <span className={styles.metricValue}>{metric.value}</span>
                  <span className={styles.metricLabel}>{metric.label}</span>
                </li>
              ))}
            </ul>

            <div className={styles.contactPanel}>
              <div className={styles.contactLink}>
                <span className={styles.contactLabel}>Plugin</span>
                <span className={styles.contactDescription}>
                  {expert.plugin.name} · v{expert.plugin.version}
                </span>
              </div>
              <div className={styles.contactLink}>
                <span className={styles.contactLabel}>Repository path</span>
                <span className={styles.contactDescription}>
                  {expert.plugin.repositoryPath}
                </span>
              </div>
              <div className={styles.contactLink}>
                <span className={styles.contactLabel}>Marknadsplatsstatus</span>
                <span className={styles.contactDescription}>
                  {expert.plugin.marketplaceListed
                    ? "Listad i den externa marketplace-katalogen."
                    : "Inte publicerad i marketplace ännu."}
                </span>
              </div>
              <a href={expert.plugin.repositoryUrl} className={styles.contactLink}>
                <span className={styles.contactLabel}>Monorepo</span>
                <span className={styles.contactDescription}>
                  Öppna pluginets kanoniska repository.
                </span>
              </a>
            </div>
          </aside>

          <div className={styles.timeline}>
            <article className={styles.detailBlock}>
              <p className={styles.eyebrow}>Sammanfattning</p>
              <h2 className={styles.sectionTitle}>Fokusområden</h2>
              <ul className={styles.detailList}>
                {expert.strengths.map((strength) => (
                  <li key={strength}>{strength}</li>
                ))}
              </ul>
            </article>

            <article className={styles.detailBlock}>
              <p className={styles.eyebrow}>Perspektiv</p>
              <p className={styles.quote}>{expert.profileQuote}</p>
            </article>

            <article className={styles.detailBlock}>
              <p className={styles.eyebrow}>Utvalda uppdrag</p>
              <div className={styles.timeline}>
                {expert.selectedEngagements.map((engagement) => (
                  <div key={engagement.title} className={styles.timelineItem}>
                    <p className={styles.timelineMeta}>
                      {engagement.client} · {engagement.period}
                    </p>
                    <h3 className={styles.timelineTitle}>{engagement.title}</h3>
                    <p className={styles.timelineText}>{engagement.summary}</p>
                    <p className={styles.timelineText}>{engagement.impact}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.detailBlock}>
              <p className={styles.eyebrow}>Erfarenhet</p>
              <div className={styles.timeline}>
                {expert.experience.map((item) => (
                  <div key={`${item.organization}-${item.title}`} className={styles.timelineItem}>
                    <p className={styles.timelineMeta}>
                      {item.organization} · {item.period}
                    </p>
                    <h3 className={styles.timelineTitle}>{item.title}</h3>
                    <p className={styles.timelineText}>{item.summary}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.detailBlock}>
              <p className={styles.eyebrow}>Utbildning och certifieringar</p>
              <div className={styles.twoColumn}>
                <div>
                  <h3 className={styles.timelineTitle}>Utbildning</h3>
                  <ul className={styles.detailList}>
                    {expert.education.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={styles.timelineTitle}>Certifieringar</h3>
                  <ul className={styles.detailList}>
                    {expert.certifications.map((entry) => (
                      <li key={entry}>{entry}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            <article className={styles.detailBlock}>
              <p className={styles.eyebrow}>Verktyg och metoder</p>
              <div className={styles.twoColumn}>
                <div>
                  <h3 className={styles.timelineTitle}>Verktyg</h3>
                  <ul className={styles.pillList}>
                    {expert.tools.map((tool) => (
                      <li key={tool} className={styles.pill}>
                        {tool}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={styles.timelineTitle}>Metoder</h3>
                  <ul className={styles.pillList}>
                    {expert.methods.map((method) => (
                      <li key={method} className={styles.pill}>
                        {method}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}

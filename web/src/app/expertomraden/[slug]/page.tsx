import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GridCell } from "@/components/site/GridCell";
import styles from "@/components/site/site.module.css";
import {
  getAreasForExpert,
  getExpertsForArea,
  getOrderedSiteData,
  getTeamsForArea,
} from "@/lib/content/query";

type ExpertAreaPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: ExpertAreaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getOrderedSiteData();
  const area = data.expertAreas.find((candidate) => candidate.slug === slug);

  if (!area) {
    return { title: "Expertområde saknas" };
  }

  return {
    title: area.name,
    description: area.shortDescription,
  };
}

export default async function ExpertAreaDetailPage({ params }: ExpertAreaPageProps) {
  const { slug } = await params;
  const data = await getOrderedSiteData();
  const area = data.expertAreas.find((candidate) => candidate.slug === slug);

  if (!area) {
    notFound();
  }

  const experts = getExpertsForArea(data, area.slug);
  const teams = getTeamsForArea(data, area.slug);

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Expertområde</p>
        <h1 className={styles.heroTitle}>{area.name}</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>{area.description}</p>
      </div>

      <section className={styles.section}>
        <div className={styles.detailLayout}>
          <div className={styles.detailSidebar}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Område</span>
              <span className={styles.metaValue}>
                <span className={styles.dot} style={{ background: area.accent }} aria-hidden />
                {area.name}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Leverabler</span>
              <ul className={styles.simpleList}>
                {area.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.detailMain}>
            <h2 className={styles.detailHeading}>Signaler</h2>
            <p className={styles.detailText}>Vanliga signaler och uppdragslägen som pekar mot detta område.</p>
            <ul className={styles.simpleList}>
              {area.signals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {experts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>Experter i området</h2>
            <span className={styles.sectionCount}>{experts.length} experter</span>
          </div>
          <div className={styles.grid}>
            {experts.map((expert) => {
              const areas = getAreasForExpert(data, expert);
              return (
                <GridCell
                  key={expert.id}
                  href={`/experter/${expert.slug}`}
                  category={expert.role}
                  categoryColor={areas[0]?.accent}
                  name={expert.name}
                  description={expert.summary}
                />
              );
            })}
          </div>
        </section>
      )}

      {teams.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>Relaterade team</h2>
            <span className={styles.sectionCount}>{teams.length} team</span>
          </div>
          <div className={styles.grid}>
            {teams.map((team) => (
              <GridCell
                key={team.id}
                href={`/team/${team.slug}`}
                category={`${team.expertSlugs.length} medlemmar`}
                name={team.name}
                description={team.shortDescription}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GridCell } from "@/components/site/GridCell";
import styles from "@/components/site/site.module.css";
import { getAreasForExpert, getExpertsForTeam, getOrderedSiteData } from "@/lib/content/query";

type TeamPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getOrderedSiteData();
  const team = data.teams.find((candidate) => candidate.slug === slug);

  if (!team) {
    return {
      title: "Team saknas",
    };
  }

  return {
    title: team.name,
    description: team.shortDescription,
  };
}

export default async function TeamDetailPage({ params }: TeamPageProps) {
  const { slug } = await params;
  const data = await getOrderedSiteData();
  const team = data.teams.find((candidate) => candidate.slug === slug);

  if (!team) {
    notFound();
  }

  const experts = getExpertsForTeam(data, team);
  const areaNames = [
    ...new Set(experts.flatMap((expert) => getAreasForExpert(data, expert).map((area) => area.name))),
  ];

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Kuraterat team</p>
        <h1 className={styles.heroTitle}>{team.name}</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>{team.description}</p>
      </div>

      <section className={styles.section}>
        <div className={styles.detailLayout}>
          <aside className={styles.detailSidebar}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Plugin</span>
              <span className={styles.metaValueMono}>{team.plugin.name} v{team.plugin.version}</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Repository</span>
              <span className={styles.metaValue}>
                <Link href={team.plugin.repositoryUrl as `https://${string}`} className={styles.textLink}>
                  {team.plugin.repositoryPath}
                </Link>
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Status</span>
              <span className={styles.metaValue}>
                {team.plugin.marketplaceListed
                  ? "Listad i den kanoniska marketplace-katalogen."
                  : "Inte publicerad i marketplace ännu."}
              </span>
            </div>
          </aside>

          <div className={styles.detailMain}>
            <h2 className={styles.detailHeading}>Hur teamet arbetar tillsammans</h2>
            <p className={styles.detailText}>{team.promptSummary}</p>
            {areaNames.length > 0 && (
              <ul className={styles.inlineList}>
                {areaNames.map((areaName) => (
                  <li key={areaName}>{areaName}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {experts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionLabel}>Experter i teamet</h2>
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
    </div>
  );
}

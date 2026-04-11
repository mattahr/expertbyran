import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExpertCard } from "@/components/site/ExpertCard";
import { PageHero } from "@/components/site/PageHero";
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
      <PageHero
        eyebrow="Kuraterat team"
        title={team.name}
        intro={team.description}
        primaryAction={{ href: "/marknadsplats", label: "Se installation" }}
        secondaryAction={{ href: "/team", label: "Alla team" }}
        asideLabel="Plugin"
        asideValue={`${team.plugin.name} · v${team.plugin.version}`}
      />

      <section className={styles.section}>
        <div className={styles.twoColumn}>
          <article className={styles.detailBlock}>
            <p className={styles.eyebrow}>Gemensam prompt</p>
            <h2 className={styles.sectionTitle}>Hur teamet arbetar tillsammans.</h2>
            <p className={styles.sectionText}>{team.promptSummary}</p>
            <ul className={styles.pillList}>
              {areaNames.map((areaName) => (
                <li key={areaName} className={styles.pill}>
                  {areaName}
                </li>
              ))}
            </ul>
          </article>

          <div className={styles.contactPanel}>
            <div className={styles.contactLink}>
              <span className={styles.contactLabel}>Repository path</span>
              <span className={styles.contactDescription}>{team.plugin.repositoryPath}</span>
            </div>
            <div className={styles.contactLink}>
              <span className={styles.contactLabel}>Marknadsplatsstatus</span>
              <span className={styles.contactDescription}>
                {team.plugin.marketplaceListed
                  ? "Listad i den kanoniska marketplace-katalogen."
                  : "Inte publicerad i marketplace ännu."}
              </span>
            </div>
            <a href={team.plugin.repositoryUrl} className={styles.contactLink}>
              <span className={styles.contactLabel}>Monorepo</span>
              <span className={styles.contactDescription}>Öppna teampluginets repository.</span>
            </a>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Experter i teamet</p>
            <h2 className={styles.sectionTitle}>Profiler som ingår i {team.name.toLowerCase()}.</h2>
          </div>
        </div>

        <div className={styles.gridCards} data-dense="true">
          {experts.map((expert) => (
            <ExpertCard key={expert.id} expert={expert} areas={getAreasForExpert(data, expert)} />
          ))}
        </div>
      </section>
    </div>
  );
}

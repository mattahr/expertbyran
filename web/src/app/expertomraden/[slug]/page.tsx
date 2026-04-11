import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ExpertCard } from "@/components/site/ExpertCard";
import { PageHero } from "@/components/site/PageHero";
import { TeamCard } from "@/components/site/TeamCard";
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
    return {
      title: "Expertområde saknas",
    };
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
      <PageHero
        eyebrow="Expertområde"
        title={area.name}
        intro={area.description}
        primaryAction={{ href: "/team", label: "Se team" }}
        secondaryAction={{ href: "/expertomraden", label: "Alla områden" }}
        asideLabel="Typiska leveranser"
        asideValue={area.deliverables.slice(0, 2).join(" och ")}
      />

      <section className={styles.section}>
        <div className={styles.twoColumn}>
          <article className={styles.detailBlock}>
            <p className={styles.eyebrow}>När området behövs</p>
            <h2 className={styles.sectionTitle}>Vanliga signaler och uppdragslägen.</h2>
            <ul className={styles.detailList}>
              {area.signals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </article>

          <article className={styles.detailBlock}>
            <p className={styles.eyebrow}>Leverabler</p>
            <h2 className={styles.sectionTitle}>Vad området brukar leverera.</h2>
            <ul className={styles.detailList}>
              {area.deliverables.map((deliverable) => (
                <li key={deliverable}>{deliverable}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Experter i området</p>
            <h2 className={styles.sectionTitle}>Experter knutna till {area.name.toLowerCase()}.</h2>
          </div>
        </div>
        {experts.length ? (
          <div className={styles.gridCards} data-dense="true">
            {experts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} areas={getAreasForExpert(data, expert)} />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Inga experter är kopplade till området ännu.</p>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.eyebrow}>Kuraterade team</p>
            <h2 className={styles.sectionTitle}>Team som ofta bär området i leverans.</h2>
          </div>
        </div>
        {teams.length ? (
          <div className={styles.gridCards}>
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} expertCount={team.expertSlugs.length} />
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>Inga team är kopplade till området ännu.</p>
        )}
      </section>
    </div>
  );
}

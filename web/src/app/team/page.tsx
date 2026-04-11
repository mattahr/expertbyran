import { TeamCard } from "@/components/site/TeamCard";
import { PageHero } from "@/components/site/PageHero";
import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";

export const metadata = {
  title: "Team",
};

export default async function TeamsPage() {
  const data = await getOrderedSiteData();

  return (
    <div className={styles.pageWrap}>
      <PageHero
        eyebrow="Kuraterade team"
        title="Team med fast expertmix och tydlig promptlogik."
        intro="Teamen samlar flera experter under en gemensam leveranslogik. Varje team motsvarar ett eget plugin i det externa monorepot."
        primaryAction={{ href: "/marknadsplats", label: "Se marknadsplats" }}
        secondaryAction={{ href: "/expertomraden", label: "Se expertområden" }}
        asideLabel="Antal team"
        asideValue={`${data.teams.length} kuraterade team i katalogen`}
      />

      <section className={styles.section}>
        <div className={styles.gridCards}>
          {data.teams.map((team) => (
            <TeamCard key={team.id} team={team} expertCount={team.expertSlugs.length} />
          ))}
        </div>
      </section>
    </div>
  );
}

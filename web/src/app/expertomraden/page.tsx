import { AreaCard } from "@/components/site/AreaCard";
import { PageHero } from "@/components/site/PageHero";
import styles from "@/components/site/site.module.css";
import { getOrderedSiteData } from "@/lib/content/query";

export const metadata = {
  title: "Expertområden",
};

export default async function ExpertAreasPage() {
  const data = await getOrderedSiteData();

  return (
    <div className={styles.pageWrap}>
      <PageHero
        eyebrow="Expertområden"
        title="Expertområden med tydligt mandat och definierad leveranslogik."
        intro="Varje område beskriver när kompetensen används, vilka leverabler som normalt tas fram och vilka experter och team som knyts till området."
        primaryAction={{ href: "/om-oss", label: "Se arbetssätt" }}
        secondaryAction={{ href: "/team", label: "Se kuraterade team" }}
        asideLabel="Antal områden"
        asideValue={`${data.expertAreas.length} kärnområden med kombinerbar expertis`}
      />

      <section className={styles.section}>
        <div className={styles.gridCards}>
          {data.expertAreas.map((area) => (
            <AreaCard key={area.id} area={area} />
          ))}
        </div>
      </section>
    </div>
  );
}

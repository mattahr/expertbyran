import type { Route } from "next";
import Link from "next/link";

import styles from "@/components/site/site.module.css";
import { getAreasForExpert, getOrderedSiteData, getTeamsForExpert } from "@/lib/content/query";

export const metadata = {
  title: "Våra experter",
};

export default async function ExpertsPage() {
  const data = await getOrderedSiteData();

  return (
    <div className={styles.pageWrap}>
      <div className={styles.hero}>
        <p className={styles.heroEyebrow}>Våra experter</p>
        <h1 className={styles.heroTitle}>Specialister med tydligt fokus.</h1>
        <div className={styles.heroLine} />
        <p className={styles.heroIntro}>
          Varje expert har djup kunskap inom sitt område och arbetar inom ett eller flera team. Klicka dig vidare för att utforska profiler, expertområden och team.
        </p>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionLabel}>Alla experter</h2>
          <span className={styles.sectionCount}>{data.experts.length} experter</span>
        </div>
        <div className={styles.grid}>
          {data.experts.map((expert) => {
            const areas = getAreasForExpert(data, expert);
            const teams = getTeamsForExpert(data, expert.slug);
            return (
              <div key={expert.id} className={styles.expertCard}>
                <span className={styles.gridCellCategory} style={areas[0] ? { color: areas[0].accent } : undefined}>
                  {areas[0] ? (
                    <span className={styles.dot} style={{ background: areas[0].accent }} aria-hidden />
                  ) : null}
                  {expert.role}
                </span>
                <Link href={`/experter/${expert.slug}` as Route} className={styles.expertCardName}>
                  {expert.name}
                </Link>
                <span className={styles.gridCellDesc}>{expert.summary}</span>
                <div className={styles.expertCardTags}>
                  {areas.map((area) => (
                    <Link key={area.slug} href={`/expertomraden/${area.slug}` as Route} className={styles.expertCardTag}>
                      <span className={styles.dot} style={{ background: area.accent }} aria-hidden />
                      {area.name}
                    </Link>
                  ))}
                  {teams.map((team) => (
                    <Link key={team.slug} href={`/team/${team.slug}` as Route} className={styles.expertCardTag}>
                      {team.name}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

import type { Route } from "next";
import Link from "next/link";

import type { Team } from "@/lib/content/schema";

import styles from "./site.module.css";

type TeamCardProps = {
  team: Team;
  expertCount?: number;
};

export function TeamCard({ team, expertCount }: TeamCardProps) {
  return (
    <article className={styles.card}>
      <p className={styles.cardMeta}>Kuraterat team</p>
      <h2 className={styles.cardTitle}>{team.name}</h2>
      <p className={styles.cardText}>{team.shortDescription}</p>
      <div className={styles.metaRow}>
        <span className={styles.metaBadge}>{team.plugin.name}</span>
        {expertCount ? <span className={styles.metaBadge}>{expertCount} experter</span> : null}
      </div>
      <p className={styles.cardCaption}>{team.promptSummary}</p>
      <Link href={`/team/${team.slug}` as Route} className={styles.textLink}>
        Visa team
      </Link>
    </article>
  );
}

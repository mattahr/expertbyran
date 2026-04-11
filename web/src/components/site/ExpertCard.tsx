import Link from "next/link";

import type { Expert, ExpertArea } from "@/lib/content/schema";

import styles from "./site.module.css";

type ExpertCardProps = {
  expert: Expert;
  areas: ExpertArea[];
};

export function ExpertCard({ expert, areas }: ExpertCardProps) {
  return (
    <article className={styles.card}>
      <p className={styles.cardMeta}>{expert.role}</p>
      <h2 className={styles.cardTitle}>{expert.name}</h2>
      <p className={styles.cardText}>{expert.summary}</p>
      <div className={styles.metaRow}>
        <span className={styles.metaBadge}>{expert.plugin.name}</span>
        <span className={styles.metaBadge}>v{expert.plugin.version}</span>
      </div>
      <ul className={styles.pillList}>
        {areas.map((area) => (
          <li key={area.slug} className={styles.pill}>
            {area.name}
          </li>
        ))}
      </ul>
      <Link href={`/experter/${expert.slug}`} className={styles.textLink}>
        Visa profil
      </Link>
    </article>
  );
}

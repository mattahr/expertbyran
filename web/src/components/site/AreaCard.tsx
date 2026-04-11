import Link from "next/link";

import type { ExpertArea } from "@/lib/content/schema";

import styles from "./site.module.css";

type AreaCardProps = {
  area: ExpertArea;
};

export function AreaCard({ area }: AreaCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardAccent} style={{ background: area.accent }} aria-hidden />
      <p className={styles.cardMeta}>Expertområde</p>
      <h2 className={styles.cardTitle}>{area.name}</h2>
      <p className={styles.cardText}>{area.shortDescription}</p>
      <ul className={styles.signalList}>
        {area.signals.slice(0, 3).map((signal) => (
          <li key={signal} className={styles.signal}>
            {signal}
          </li>
        ))}
      </ul>
      <Link href={`/expertomraden/${area.slug}`} className={styles.textLink}>
        Visa område
      </Link>
    </article>
  );
}

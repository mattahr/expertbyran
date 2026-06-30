import Link from "next/link";

import { parseStatsRange } from "@/lib/admin/stats-params";
import { getAnalyticsStore } from "@/lib/stores";

import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>{label}</div>
      <div className={styles.cardValue}>{value.toLocaleString("sv-SE")}</div>
    </div>
  );
}

export default async function AdminHome() {
  const store = getAnalyticsStore();
  const range = parseStatsRange(new URLSearchParams(), Date.now(), store.earliestDay());
  const overview = store.overview(range);

  return (
    <div>
      <h1 className={styles.pageTitle}>Översikt</h1>
      <p className={styles.pageIntro}>Senaste 30 dagarna.</p>

      <div className={styles.cards}>
        <Card label="Sidvisningar" value={overview.summary.pageviews} />
        <Card label="Unika besökare" value={overview.summary.visitors} />
        <Card label="Snitt per dag" value={overview.summary.avgPerDay} />
        <Card label="Botträffar (exkl.)" value={overview.summary.botPageviews} />
      </div>

      <div className={styles.quicklinks}>
        <Link href="/admin/statistik" className={styles.quicklink}>
          → Detaljerad statistik
        </Link>
        <Link href="/admin/blogg" className={styles.quicklink}>
          → Hantera blogginlägg
        </Link>
      </div>
    </div>
  );
}

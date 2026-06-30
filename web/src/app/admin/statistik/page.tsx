import type { Metadata } from "next";

import { StatsDashboard } from "@/components/admin/StatsDashboard";

import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistik",
  robots: { index: false, follow: false },
};

export default function StatistikPage() {
  return (
    <div>
      <h1 className={styles.pageTitle}>Besöksstatistik</h1>
      <p className={styles.pageIntro}>Självhostad webbanalys — uppdateras i realtid.</p>
      <StatsDashboard />
    </div>
  );
}

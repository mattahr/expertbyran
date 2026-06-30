import type { Metadata } from "next";

import { RadarAdmin } from "@/components/admin/RadarAdmin";

import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Radar",
  robots: { index: false, follow: false },
};

export default function RadarAdminPage() {
  return (
    <div>
      <h1 className={styles.pageTitle}>Teknikradar</h1>
      <p className={styles.pageIntro}>Redigera metadata, segment, ringar och blips — eller radera.</p>
      <RadarAdmin />
    </div>
  );
}

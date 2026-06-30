import type { Metadata } from "next";

import { FORESIGHT_CONFIG, MarkdownContentAdmin } from "@/components/admin/MarkdownContentAdmin";

import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Foresight",
  robots: { index: false, follow: false },
};

export default function ForesightAdminPage() {
  return (
    <div>
      <h1 className={styles.pageTitle}>Foresights</h1>
      <p className={styles.pageIntro}>Redigera metadata, författare, områden, horisont och text — eller radera.</p>
      <MarkdownContentAdmin config={FORESIGHT_CONFIG} />
    </div>
  );
}

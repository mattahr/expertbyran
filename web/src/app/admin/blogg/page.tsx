import type { Metadata } from "next";

import { BLOG_CONFIG, MarkdownContentAdmin } from "@/components/admin/MarkdownContentAdmin";

import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogg",
  robots: { index: false, follow: false },
};

export default function BloggAdminPage() {
  return (
    <div>
      <h1 className={styles.pageTitle}>Blogginlägg</h1>
      <p className={styles.pageIntro}>Redigera metadata, författare, områden och själva texten — eller radera inlägg.</p>
      <MarkdownContentAdmin config={BLOG_CONFIG} />
    </div>
  );
}

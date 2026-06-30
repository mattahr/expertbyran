import type { Metadata } from "next";

import { BlogAdmin } from "@/components/admin/BlogAdmin";

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
      <p className={styles.pageIntro}>Redigera metadata eller radera inlägg.</p>
      <BlogAdmin />
    </div>
  );
}

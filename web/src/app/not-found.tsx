import Link from "next/link";

import styles from "@/components/site/site.module.css";

export default function NotFound() {
  return (
    <div className={styles.pageWrap}>
      <div className={styles.notFound}>
        <h1 className={styles.notFoundCode}>404</h1>
        <p className={styles.notFoundText}>
          Resursen du försökte nå matchar inte längre någon publik profil eller sida i Expertbyrån.
        </p>
        <Link href="/" className={styles.textLink}>
          Till startsidan
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";

import styles from "@/components/site/site.module.css";

export default function NotFound() {
  return (
    <div className={styles.pageWrap}>
      <section className={styles.pageHero}>
        <span className={styles.eyebrow}>404</span>
        <h1 className={styles.heroTitle}>Sidan finns inte.</h1>
        <p className={styles.heroIntro}>
          Resursen du försökte nå matchar inte längre någon publik profil eller sida i
          Expertbyrån.
        </p>
        <div className={styles.heroActions}>
          <Link href="/" className={styles.buttonPrimary}>
            Till startsidan
          </Link>
          <Link href="/expertomraden" className={styles.buttonSecondary}>
            Utforska expertområden
          </Link>
        </div>
      </section>
    </div>
  );
}

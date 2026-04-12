import type { Route } from "next";
import Link from "next/link";

import { getSiteData } from "@/lib/content/store";

import styles from "./site.module.css";

type SiteChromeProps = {
  children: React.ReactNode;
};

const navigation = [
  { href: "/om-oss", label: "Om byrån" },
  { href: "/expertomraden", label: "Expertområden" },
  { href: "/team", label: "Team" },
  { href: "/marknadsplats", label: "Marknadsplats" },
] as const;

export async function SiteChrome({ children }: SiteChromeProps) {
  const data = await getSiteData();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            {data.site.name}
          </Link>
          <nav className={styles.nav} aria-label="Primär navigering">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href as Route} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span>{data.site.name}</span>
          <span>Virtuellt konsultnätverk</span>
        </div>
      </footer>
    </div>
  );
}

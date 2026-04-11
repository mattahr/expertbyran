import type { Route } from "next";
import Link from "next/link";

import { getOrderedSiteData } from "@/lib/content/query";

import styles from "./site.module.css";

type SiteChromeProps = {
  children: React.ReactNode;
};

const navigation = [
  { href: "/om-oss", label: "Om byrån" },
  { href: "/expertomraden", label: "Expertområden" },
  { href: "/team", label: "Team" },
  { href: "/marknadsplats", label: "Marknadsplats" },
  { href: "/kontakt", label: "Kontakt/API" },
] as const;

export async function SiteChrome({ children }: SiteChromeProps) {
  const data = await getOrderedSiteData();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerTop}>
            <Link href="/" className={styles.brand}>
              <span className={styles.brandName}>{data.site.name}</span>
              <span className={styles.brandTagline}>{data.site.tagline}</span>
            </Link>

            <nav className={styles.nav} aria-label="Primär navigering">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href as Route} className={styles.navLink}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className={styles.areaStrip}>
            <span className={styles.areaStripLabel}>Expertområden</span>
            <nav className={styles.areaNav} aria-label="Direktnavigering för expertområden">
              {data.expertAreas.map((area) => (
                <Link
                  key={area.slug}
                  href={`/expertomraden/${area.slug}`}
                  className={styles.areaNavLink}
                >
                  {area.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p>{data.site.name} är ett helt virtuellt specialistföretag med AI-baserad bemanning.</p>
          <p>Plugins och kanonisk marketplace ligger externt i monorepot och speglas här som katalog.</p>
        </div>
      </footer>
    </div>
  );
}

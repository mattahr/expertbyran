import type { Route } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { getSiteData } from "@/lib/content/store";

import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import styles from "./site.module.css";

type SiteChromeProps = {
  children: React.ReactNode;
};

const navigation = [
  { href: "/om-oss", label: "Om byrån" },
  { href: "/experter", label: "Våra experter" },
  { href: "/expertomraden", label: "Expertområden" },
  { href: "/team", label: "Team" },
  { href: "/marknadsplats", label: "Marknadsplats" },
  { href: "/blogg", label: "Blogg" },
] as const;

async function getCurrentPath(): Promise<string> {
  const headerList = await headers();
  // Next.js exponerar inte pathname i server-komponenter direkt;
  // vi förlitar oss på x-pathname satt via middleware, annars "/".
  return headerList.get("x-pathname") ?? "/";
}

export async function SiteChrome({ children }: SiteChromeProps) {
  const data = await getSiteData();
  const currentPath = await getCurrentPath();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <Logo size={16} className={styles.brandLogo} />
            <span>{data.site.name}</span>
          </Link>
          <nav className={styles.nav} aria-label="Primär navigering">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href as Route} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </nav>
          <MobileNav
            items={navigation}
            currentPath={currentPath}
            siteTagline={`${data.site.name} — Virtuellt konsultnätverk`}
          />
        </div>
      </header>

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Logo size={14} />
            <span>{data.site.name}</span>
          </div>
          <nav className={styles.footerNav} aria-label="Sekundär navigering">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href as Route} className={styles.footerLink}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className={styles.footerMeta}>Virtuellt konsultnätverk</div>
        </div>
      </footer>
    </div>
  );
}

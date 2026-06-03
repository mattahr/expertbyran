import type { Route } from "next";
import Link from "next/link";

import { getSiteData } from "@/lib/content/store";

import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";
import { PrimaryNav } from "./PrimaryNav";
import styles from "./site.module.css";

type SiteChromeProps = {
  children: React.ReactNode;
};

const navigation = [
  { href: "/expertomraden", label: "Expertområden" },
  { href: "/experter", label: "Våra experter" },
  { href: "/marknadsplats", label: "Marknadsplats" },
  { href: "/blogg", label: "Blogg" },
  { href: "/radar", label: "Radar" },
  { href: "/foresight", label: "Foresight" },
] as const;

export async function SiteChrome({ children }: SiteChromeProps) {
  const data = await getSiteData();

  return (
    <div className={styles.shell}>
      <div className={styles.noticeBanner} role="note" aria-label="Information om webbplatsen">
        <div className={styles.noticeBannerInner}>
          <span className={styles.noticeBannerText}>
            Detta är en webbplats för ett påhittat företag. Innehållet är skapat med generativ AI och ska inte tas på allvar.
          </span>
          <a
            href="https://paperclip.ahrens.nu"
            className={styles.noticeLoginButton}
            aria-label="Logga in i Paperclip"
          >
            <svg
              className={styles.loginIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M16.5 6v11.5a4 4 0 0 1-8 0V5a2.5 2.5 0 0 1 5 0v10.5a1 1 0 0 1-2 0V6H10v9.5a2.5 2.5 0 0 0 5 0V5a4 4 0 0 0-8 0v12.5a5.5 5.5 0 0 0 11 0V6h-1.5Z" />
            </svg>
            <span>Logga in</span>
          </a>
        </div>
      </div>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand}>
            <Logo size={16} className={styles.brandLogo} />
            <span>{data.site.name}</span>
          </Link>
          <PrimaryNav items={navigation} />
          <MobileNav
            items={navigation}
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

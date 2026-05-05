"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./site.module.css";

export type NavItem = {
  href: string;
  label: string;
};

function normalizePath(path: string | null | undefined) {
  if (!path) return "/";

  const [pathname] = path.split("?");
  return pathname.replace(/\/+$/, "") || "/";
}

export function isNavItemActive(href: string, pathname: string | null | undefined) {
  const normalizedHref = normalizePath(href);
  const normalizedPathname = normalizePath(pathname);

  if (normalizedHref === "/") {
    return normalizedPathname === "/";
  }

  return normalizedPathname === normalizedHref || normalizedPathname.startsWith(`${normalizedHref}/`);
}

type PrimaryNavProps = {
  items: readonly NavItem[];
};

export function PrimaryNav({ items }: PrimaryNavProps) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Primär navigering">
      {items.map((item) => {
        const isActive = isNavItemActive(item.href, pathname);
        return (
          <Link
            key={item.href}
            href={item.href as Route}
            className={isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

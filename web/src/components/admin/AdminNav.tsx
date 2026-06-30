"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import styles from "@/app/admin/admin.module.css";

const LINKS = [
  { href: "/admin", label: "Översikt" },
  { href: "/admin/statistik", label: "Statistik" },
  { href: "/admin/blogg", label: "Blogg" },
  { href: "/admin/foresight", label: "Foresight" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/v1/admin/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <span className={styles.brand}>Expertbyrån · Admin</span>
        <nav className={styles.navLinks}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? styles.active : styles.link}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={logout} className={styles.logout}>
          Logga ut
        </button>
      </div>
    </header>
  );
}

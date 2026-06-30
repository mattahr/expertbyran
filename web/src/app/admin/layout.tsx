import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/AdminNav";
import { isAuthenticated } from "@/lib/admin/server-session";

import styles from "./admin.module.css";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const onLogin = pathname.startsWith("/admin/login");

  if (onLogin) {
    return <div className={styles.loginShell}>{children}</div>;
  }

  if (!(await isAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className={styles.shell}>
      <AdminNav />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

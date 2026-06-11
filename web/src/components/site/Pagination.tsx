import type { Route } from "next";
import Link from "next/link";

import styles from "@/components/site/site.module.css";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  /** Query-parametrar som ska bevaras mellan sidor (t.ex. områdesfilter). */
  extraParams?: [string, string][];
};

export function Pagination({ basePath, page, totalPages, extraParams = [] }: PaginationProps) {
  if (totalPages <= 1) return null;

  const hrefFor = (target: number): Route => {
    const params = new URLSearchParams();
    for (const [key, value] of extraParams) params.append(key, value);
    if (target > 1) params.set("sida", String(target));
    const query = params.toString();
    return (query ? `${basePath}?${query}` : basePath) as Route;
  };

  return (
    <nav className={styles.pagination} aria-label="Sidnavigering">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={styles.blogFilterPill} rel="prev">
          ← Föregående
        </Link>
      ) : (
        <span className={styles.paginationDisabled} aria-hidden>
          ← Föregående
        </span>
      )}
      <span className={styles.paginationStatus}>
        Sida {page} av {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={styles.blogFilterPill} rel="next">
          Nästa →
        </Link>
      ) : (
        <span className={styles.paginationDisabled} aria-hidden>
          Nästa →
        </span>
      )}
    </nav>
  );
}

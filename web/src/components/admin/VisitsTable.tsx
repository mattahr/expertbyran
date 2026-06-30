"use client";

import { useEffect, useState } from "react";

import type { VisitRow } from "@/lib/stores/types";

import styles from "@/app/admin/admin.module.css";

const PAGE_SIZE = 50;

const DEVICE_LABELS: Record<string, string> = {
  desktop: "Dator",
  mobile: "Mobil",
  tablet: "Surfplatta",
  bot: "Bott",
  other: "Övrigt",
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" });
}

export function VisitsTable({ rangeQuery, excludeBots }: { rangeQuery: string; excludeBots: boolean }) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Återställ till sida 1 när intervall/filter ändras.
  useEffect(() => {
    setPage(1);
  }, [rangeQuery, excludeBots, q]);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    const qs = new URLSearchParams(rangeQuery);
    qs.set("excludeBots", String(excludeBots));
    qs.set("page", String(page));
    qs.set("pageSize", String(PAGE_SIZE));
    if (q.trim()) qs.set("q", q.trim());

    fetch(`/api/v1/admin/stats/visits?${qs.toString()}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fel"))))
      .then((d: { rows: VisitRow[]; total: number }) => {
        setRows(d.rows ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [rangeQuery, excludeBots, page, q]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <input
        className={styles.searchInput}
        placeholder="Sök IP, sida eller user-agent…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tid</th>
              <th>IP</th>
              <th>Sida</th>
              <th>Land</th>
              <th>Webbläsare</th>
              <th>OS</th>
              <th>Enhet</th>
              <th>Källa</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.ts}-${i}`}>
                <td>{formatTime(r.ts)}</td>
                <td>{r.ip || "—"}</td>
                <td>{r.path}</td>
                <td>{r.countryName ?? "—"}</td>
                <td>{r.browser ?? "—"}</td>
                <td>{r.os ?? "—"}</td>
                <td>
                  {DEVICE_LABELS[r.device] ?? r.device}
                  {r.isBot ? <span className={styles.botBadge}>bot</span> : null}
                </td>
                <td>{r.referrerHost ?? r.source}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.empty}>
                  {loading ? "Laddar…" : "Inga besök i perioden."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          ← Föregående
        </button>
        <span>
          Sida {page} av {pages} · {total.toLocaleString("sv-SE")} besök
        </span>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage((p) => Math.min(pages, p + 1))}
          disabled={page >= pages}
        >
          Nästa →
        </button>
      </div>
    </div>
  );
}

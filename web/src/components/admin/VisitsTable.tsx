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

export type OnFilter = (key: string, value: string, label: string) => void;

function CellLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={styles.cellLink} onClick={onClick} title="Filtrera på detta">
      {children}
    </button>
  );
}

export function VisitsTable({
  rangeQuery,
  filterQuery,
  excludeBots,
  onFilter,
}: {
  rangeQuery: string;
  filterQuery: string;
  excludeBots: boolean;
  onFilter: OnFilter;
}) {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<VisitRow[]>([]);
  const [total, setTotal] = useState(0);

  const resetKey = `${rangeQuery}|${filterQuery}|${excludeBots}|${q}`;
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  useEffect(() => {
    const ctrl = new AbortController();
    const qs = new URLSearchParams(rangeQuery);
    new URLSearchParams(filterQuery).forEach((v, k) => qs.set(k, v));
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
      .catch(() => {});
    return () => ctrl.abort();
  }, [rangeQuery, filterQuery, excludeBots, page, q]);

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
              <th>Besökare</th>
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
                <td>
                  <CellLink
                    onClick={() => onFilter("visitorId", r.visitorId, `Besökare ${r.visitorId.slice(0, 8)}…`)}
                  >
                    {r.visitorId.slice(0, 8)}
                  </CellLink>
                </td>
                <td>{r.ip || "—"}</td>
                <td>
                  <CellLink onClick={() => onFilter("path", r.path, `Sida: ${r.path}`)}>{r.path}</CellLink>
                </td>
                <td>
                  {r.countryName ? (
                    <CellLink onClick={() => onFilter("country", r.country ?? "??", `Land: ${r.countryName}`)}>
                      {r.countryName}
                    </CellLink>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {r.browser ? (
                    <CellLink onClick={() => onFilter("browser", r.browser ?? "Okänd", `Webbläsare: ${r.browser}`)}>
                      {r.browser}
                    </CellLink>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {r.os ? (
                    <CellLink onClick={() => onFilter("os", r.os ?? "Okänd", `OS: ${r.os}`)}>{r.os}</CellLink>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <CellLink
                    onClick={() => onFilter("device", r.device, `Enhet: ${DEVICE_LABELS[r.device] ?? r.device}`)}
                  >
                    {DEVICE_LABELS[r.device] ?? r.device}
                  </CellLink>
                  {r.isBot ? <span className={styles.botBadge}>bot</span> : null}
                </td>
                <td>{r.referrerHost ?? r.source}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className={styles.empty}>
                  Inga besök i perioden.
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

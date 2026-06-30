"use client";

import { useEffect, useState } from "react";

import {
  PRESET_LABELS,
  rangeToQuery,
  todayStockholm,
  type RangePreset,
} from "@/lib/admin/date-range";
import type { OverviewResult } from "@/lib/stores/types";

import { BarList, type BarItem } from "./BarList";
import { DonutChart } from "./DonutChart";
import { TimeseriesChart } from "./TimeseriesChart";
import { VisitsTable, type OnFilter } from "./VisitsTable";
import styles from "@/app/admin/admin.module.css";

const SOURCE_LABELS: Record<string, string> = {
  direct: "Direkt",
  internal: "Intern",
  search: "Sök",
  social: "Socialt",
  referral: "Hänvisning",
};
const DEVICE_LABELS: Record<string, string> = {
  desktop: "Dator",
  mobile: "Mobil",
  tablet: "Surfplatta",
  bot: "Bott",
  other: "Övrigt",
};
const SECTION_LABELS: Record<string, string> = {
  "/": "Start",
  "/blogg": "Blogg",
  "/foresight": "Foresight",
  "/radar": "Radar",
  "/experter": "Experter",
  "/expertomraden": "Expertområden",
  "/marknadsplats": "Marknadsplats",
};
const sectionLabel = (s: string) => SECTION_LABELS[s] ?? (s === "/" ? "Start" : s);

type FilterKey = "path" | "pathPrefix" | "country" | "browser" | "os" | "device" | "source" | "visitorId";
type ActiveFilters = Partial<Record<FilterKey, { value: string; label: string }>>;

const PRESETS: RangePreset[] = ["7", "30", "90", "all"];

function Panel({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: BarItem[];
  onSelect?: (value: string) => void;
}) {
  return (
    <div>
      <div className={styles.sectionTitle}>{title}</div>
      <BarList items={items} onSelect={onSelect} />
    </div>
  );
}

export function StatsDashboard() {
  const [preset, setPreset] = useState<RangePreset>("30");
  const [custom, setCustom] = useState({ from: todayStockholm(), to: todayStockholm() });
  const [excludeBots, setExcludeBots] = useState(true);
  const [filters, setFilters] = useState<ActiveFilters>({});
  const [data, setData] = useState<OverviewResult | null>(null);
  const [version, setVersion] = useState(0); // bumpas vid namnändring → omladdning

  const bump = () => setVersion((v) => v + 1);
  const rangeQuery = rangeToQuery(preset, custom);
  const filterQuery = (() => {
    const qs = new URLSearchParams();
    for (const [key, f] of Object.entries(filters)) if (f) qs.set(key, f.value);
    return qs.toString();
  })();

  useEffect(() => {
    const ctrl = new AbortController();
    const qs = new URLSearchParams(rangeQuery);
    new URLSearchParams(filterQuery).forEach((v, k) => qs.set(k, v));
    qs.set("excludeBots", String(excludeBots));
    fetch(`/api/v1/admin/stats/overview?${qs.toString()}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fel"))))
      .then((d: OverviewResult) => setData(d))
      .catch(() => {});
    return () => ctrl.abort();
  }, [rangeQuery, filterQuery, excludeBots, version]);

  const setFilter: OnFilter = (key, value, label) =>
    setFilters((f) => ({ ...f, [key]: { value, label } }));
  const removeFilter = (key: string) =>
    setFilters((f) => {
      const next = { ...f };
      delete next[key as FilterKey];
      return next;
    });

  async function renameVisitor(visitorId: string, current: string) {
    const name = window.prompt(`Nytt namn för "${current}" (lämna tomt för att ta bort)`, current);
    if (name === null) return;
    const trimmed = name.trim();
    const res = trimmed
      ? await fetch(`/api/v1/admin/visitor-labels/${visitorId}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ label: trimmed }),
        })
      : await fetch(`/api/v1/admin/visitor-labels/${visitorId}`, { method: "DELETE" });
    if (res.ok) bump();
  }

  async function removeVisitor(visitorId: string, label: string) {
    if (!window.confirm(`Ta bort namnet "${label}"? (besöken finns kvar)`)) return;
    const res = await fetch(`/api/v1/admin/visitor-labels/${visitorId}`, { method: "DELETE" });
    if (res.ok) bump();
  }

  const s = data?.summary;
  const activeChips = Object.entries(filters).filter(([, f]) => f) as [FilterKey, { value: string; label: string }][];

  return (
    <div>
      {/* Intervall + bot-toggle */}
      <div className={styles.controls}>
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className={preset === p ? styles.controlBtnActive : styles.controlBtn}
            onClick={() => setPreset(p)}
          >
            {PRESET_LABELS[p as Exclude<RangePreset, "custom">]}
          </button>
        ))}
        <input
          type="date"
          className={styles.dateInput}
          value={custom.from}
          max={custom.to}
          onChange={(e) => {
            setCustom((c) => ({ ...c, from: e.target.value }));
            setPreset("custom");
          }}
        />
        <input
          type="date"
          className={styles.dateInput}
          value={custom.to}
          min={custom.from}
          onChange={(e) => {
            setCustom((c) => ({ ...c, to: e.target.value }));
            setPreset("custom");
          }}
        />
        <label className={`${styles.toggle} ${styles.spacer}`}>
          <input type="checkbox" checked={excludeBots} onChange={(e) => setExcludeBots(e.target.checked)} />
          Exkludera bottar
        </label>
      </div>

      {/* Aktiva drill-down-filter */}
      {activeChips.length > 0 && (
        <div className={styles.chips}>
          <span className={styles.chipsLabel}>Filter:</span>
          {activeChips.map(([key, f]) => (
            <button key={key} type="button" className={styles.chip} onClick={() => removeFilter(key)}>
              {f.label} <span className={styles.chipX}>✕</span>
            </button>
          ))}
          <button type="button" className={styles.chipClear} onClick={() => setFilters({})}>
            Rensa alla
          </button>
        </div>
      )}

      {/* Nyckeltal */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Sidvisningar</div>
          <div className={styles.cardValue}>{(s?.pageviews ?? 0).toLocaleString("sv-SE")}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Unika besökare</div>
          <div className={styles.cardValue}>{(s?.visitors ?? 0).toLocaleString("sv-SE")}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Snitt per dag</div>
          <div className={styles.cardValue}>{(s?.avgPerDay ?? 0).toLocaleString("sv-SE")}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Botträffar {excludeBots ? "(exkl.)" : ""}</div>
          <div className={styles.cardValue}>{(s?.botPageviews ?? 0).toLocaleString("sv-SE")}</div>
        </div>
      </div>

      {/* Tidsserie */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Sidvisningar per dag</div>
        <TimeseriesChart points={data?.timeseries ?? []} />
      </div>

      {/* Fördelning per innehållstyp + populäraste sidor */}
      <div className={styles.section}>
        <div className={styles.twoColWide}>
          <div>
            <div className={styles.sectionTitle}>Fördelning per innehållstyp</div>
            <DonutChart
              slices={(data?.sections ?? []).map((sec) => ({
                label: sectionLabel(sec.section),
                value: sec.pageviews,
                filterValue: sec.section,
              }))}
              onSelect={(section) => setFilter("pathPrefix", section, `Sektion: ${sectionLabel(section)}`)}
            />
          </div>
          <Panel
            title="Populäraste sidor"
            items={(data?.topPages ?? []).map((p) => ({ label: p.path, value: p.pageviews, sub: `${p.visitors} unika`, filterValue: p.path }))}
            onSelect={(path) => setFilter("path", path, `Sida: ${path}`)}
          />
        </div>
      </div>

      {/* Övriga topplistor (klickbara) */}
      <div className={styles.section}>
        <div className={styles.panelsGrid}>
          <Panel
            title="Länder"
            items={(data?.topCountries ?? []).map((c) => ({ label: c.countryName, value: c.pageviews, filterValue: c.country }))}
            onSelect={(code) => {
              const c = data?.topCountries.find((x) => x.country === code);
              setFilter("country", code, `Land: ${c?.countryName ?? code}`);
            }}
          />
          <Panel
            title="Trafikkällor"
            items={(data?.topSources ?? []).map((x) => ({ label: SOURCE_LABELS[x.source] ?? x.source, value: x.pageviews, filterValue: x.source }))}
            onSelect={(src) => setFilter("source", src, `Källa: ${SOURCE_LABELS[src] ?? src}`)}
          />
          <Panel
            title="Hänvisande sajter"
            items={(data?.topReferrers ?? []).map((x) => ({ label: x.host, value: x.pageviews }))}
          />
          <Panel
            title="Webbläsare"
            items={(data?.topBrowsers ?? []).map((x) => ({ label: x.browser, value: x.pageviews }))}
            onSelect={(b) => setFilter("browser", b, `Webbläsare: ${b}`)}
          />
          <Panel
            title="Operativsystem"
            items={(data?.topOs ?? []).map((x) => ({ label: x.os, value: x.pageviews }))}
            onSelect={(o) => setFilter("os", o, `OS: ${o}`)}
          />
          <Panel
            title="Enheter"
            items={(data?.topDevices ?? []).map((x) => ({ label: DEVICE_LABELS[x.device] ?? x.device, value: x.pageviews, filterValue: x.device }))}
            onSelect={(d) => setFilter("device", d, `Enhet: ${DEVICE_LABELS[d] ?? d}`)}
          />
          <Panel
            title="Skärmupplösningar"
            items={(data?.topResolutions ?? []).map((x) => ({ label: x.resolution, value: x.pageviews }))}
          />
          <Panel
            title="Tidszoner"
            items={(data?.topTimezones ?? []).map((x) => ({ label: x.timezone, value: x.pageviews }))}
          />
          <Panel
            title="Kampanjer (UTM)"
            items={(data?.topCampaigns ?? []).map((x) => ({
              label: x.campaign,
              value: x.pageviews,
              sub: [x.source, x.medium].filter(Boolean).join(" / ") || undefined,
            }))}
          />
        </div>
      </div>

      {/* Namngivna besökare */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Namngivna besökare</div>
        {(data?.namedVisitors ?? []).length === 0 ? (
          <p className={styles.empty}>
            Inga namngivna besökare ännu — klicka på ✎ vid en besökare i tabellen nedan för att ge den ett namn.
          </p>
        ) : (
          <div>
            {(data?.namedVisitors ?? []).map((nv) => (
              <div key={nv.visitorId} className={styles.blogRow}>
                <div>
                  <div className={styles.blogTitle}>{nv.label}</div>
                  <div className={styles.blogMeta}>
                    {nv.pageviews.toLocaleString("sv-SE")} besök i perioden
                    {nv.lastTs
                      ? ` · senast ${new Date(nv.lastTs).toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" })}`
                      : ""}{" "}
                    · {nv.visitorId.slice(0, 8)}…
                  </div>
                </div>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.smallBtn}
                    onClick={() => setFilter("visitorId", nv.visitorId, `Besökare: ${nv.label}`)}
                  >
                    Visa besök
                  </button>
                  <button type="button" className={styles.smallBtn} onClick={() => renameVisitor(nv.visitorId, nv.label)}>
                    Byt namn
                  </button>
                  <button type="button" className={styles.dangerBtn} onClick={() => removeVisitor(nv.visitorId, nv.label)}>
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Råa besök */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Besök</div>
        <VisitsTable
          rangeQuery={rangeQuery}
          filterQuery={filterQuery}
          excludeBots={excludeBots}
          onFilter={setFilter}
          onChanged={bump}
          refreshKey={version}
        />
      </div>

      <p className={styles.footerNote}>
        Klicka på en sida, sektion, land, källa, webbläsare, enhet eller besökare för att borra ner. ·
        IP-geodata: DB-IP (db-ip.com), CC BY 4.0.
      </p>
    </div>
  );
}

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
import { TimeseriesChart } from "./TimeseriesChart";
import { VisitsTable } from "./VisitsTable";
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

function Panel({ title, items, emptyText }: { title: string; items: BarItem[]; emptyText?: string }) {
  return (
    <div>
      <div className={styles.sectionTitle}>{title}</div>
      <BarList items={items} emptyText={emptyText} />
    </div>
  );
}

const PRESETS: RangePreset[] = ["7", "30", "90", "all"];

export function StatsDashboard() {
  const [preset, setPreset] = useState<RangePreset>("30");
  const [custom, setCustom] = useState({ from: todayStockholm(), to: todayStockholm() });
  const [excludeBots, setExcludeBots] = useState(true);
  const [data, setData] = useState<OverviewResult | null>(null);

  const rangeQuery = rangeToQuery(preset, custom);

  useEffect(() => {
    const ctrl = new AbortController();
    const qs = new URLSearchParams(rangeQuery);
    qs.set("excludeBots", String(excludeBots));
    fetch(`/api/v1/admin/stats/overview?${qs.toString()}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("fel"))))
      .then((d: OverviewResult) => setData(d))
      .catch(() => {});
    return () => ctrl.abort();
  }, [rangeQuery, excludeBots]);

  const s = data?.summary;

  return (
    <div>
      {/* Kontroller */}
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
          <input
            type="checkbox"
            checked={excludeBots}
            onChange={(e) => setExcludeBots(e.target.checked)}
          />
          Exkludera bottar
        </label>
      </div>

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

      {/* Topplistor */}
      <div className={styles.section}>
        <div className={styles.panelsGrid}>
          <Panel
            title="Populäraste sidor"
            items={(data?.topPages ?? []).map((p) => ({ label: p.path, value: p.pageviews, sub: `${p.visitors} unika` }))}
          />
          <Panel
            title="Länder"
            items={(data?.topCountries ?? []).map((c) => ({ label: c.countryName, value: c.pageviews }))}
          />
          <Panel
            title="Trafikkällor"
            items={(data?.topSources ?? []).map((x) => ({ label: SOURCE_LABELS[x.source] ?? x.source, value: x.pageviews }))}
          />
          <Panel
            title="Hänvisande sajter"
            items={(data?.topReferrers ?? []).map((x) => ({ label: x.host, value: x.pageviews }))}
          />
          <Panel
            title="Webbläsare"
            items={(data?.topBrowsers ?? []).map((x) => ({ label: x.browser, value: x.pageviews }))}
          />
          <Panel
            title="Operativsystem"
            items={(data?.topOs ?? []).map((x) => ({ label: x.os, value: x.pageviews }))}
          />
          <Panel
            title="Enheter"
            items={(data?.topDevices ?? []).map((x) => ({ label: DEVICE_LABELS[x.device] ?? x.device, value: x.pageviews }))}
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

      {/* Råa besök */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Besök</div>
        <VisitsTable rangeQuery={rangeQuery} excludeBots={excludeBots} />
      </div>

      <p className={styles.footerNote}>
        IP-geodata: DB-IP (db-ip.com), licensierad under CC BY 4.0.
      </p>
    </div>
  );
}

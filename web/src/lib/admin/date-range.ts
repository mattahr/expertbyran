// web/src/lib/admin/date-range.ts
//
// Klient-säkra datumhjälpare för dashboardens intervallväljare. Beräknar
// datum i Europe/Stockholm för att matcha serverns dag-aggregering.
export type RangePreset = "7" | "30" | "90" | "all" | "custom";

export function todayStockholm(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function shiftDays(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

/** Bygger query-strängdelen (from/to eller range=all) för ett valt intervall. */
export function rangeToQuery(preset: RangePreset, custom?: { from: string; to: string }): string {
  if (preset === "all") return "range=all";
  if (preset === "custom" && custom?.from && custom?.to) {
    return `from=${custom.from}&to=${custom.to}`;
  }
  const today = todayStockholm();
  const days = preset === "7" ? 7 : preset === "90" ? 90 : 30;
  return `from=${shiftDays(today, -(days - 1))}&to=${today}`;
}

export const PRESET_LABELS: Record<Exclude<RangePreset, "custom">, string> = {
  "7": "7 dagar",
  "30": "30 dagar",
  "90": "90 dagar",
  all: "Allt",
};

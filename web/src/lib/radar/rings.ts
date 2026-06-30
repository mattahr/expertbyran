// Standarduppsättning av ringar — den redaktionella hållning som nya radarer
// startar med. Ringar är numera per-radar-data (se radarMetaSchema.rings); den
// här filen äger bara standardvärdena, färgpaletten och uppslagshjälparen.
// Inre ring = anta (mest mogen), yttre = avvakta.
import type { Ring } from "@/lib/radar/schema";

export const DEFAULT_RINGS: Ring[] = [
  { id: "anta", label: "Anta", blurb: "I drift, hög mognad", color: "#0e7c7b" },
  { id: "prova", label: "Pröva", blurb: "Pilot, bygg kompetens", color: "#1d4e74" },
  { id: "bevaka", label: "Bevaka", blurb: "Följ utvecklingen aktivt", color: "#d4982b" },
  { id: "avvakta", label: "Avvakta", blurb: "Omogen / hög osäkerhet", color: "#64718a" },
];

// Förslagsfärger för nya ringar i admin (de fyra första matchar standardringarna
// så att backfilade radarer ser identiska ut). Räcker för max-antalet ringar (6).
export const RING_COLORS = [
  "#0e7c7b",
  "#1d4e74",
  "#d4982b",
  "#64718a",
  "#92651a",
  "#11314c",
];

/** Bygger ett id→ring-uppslag för en radars egna ringar. */
export function ringsById(rings: Ring[]): Record<string, Ring> {
  return Object.fromEntries(rings.map((ring) => [ring.id, ring]));
}

/** En fräsch kopia av standardringarna (för seedning/default utan delad referens). */
export function defaultRings(): Ring[] {
  return DEFAULT_RINGS.map((ring) => ({ ...ring }));
}

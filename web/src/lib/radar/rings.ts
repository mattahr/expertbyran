// Fast ringuppsättning — redaktionell hållning, delas av alla radarer.
// Inre ring = anta, yttre = avvakta. Färgerna är web/:s palett.
export const RING_IDS = ["anta", "prova", "bevaka", "avvakta"] as const;

export type RingId = (typeof RING_IDS)[number];

export type Ring = {
  id: RingId;
  label: string;
  blurb: string;
  color: string;
};

export const RINGS: Ring[] = [
  { id: "anta", label: "Anta", blurb: "I drift, hög mognad", color: "#0e7c7b" },
  { id: "prova", label: "Pröva", blurb: "Pilot, bygg kompetens", color: "#1d4e74" },
  { id: "bevaka", label: "Bevaka", blurb: "Följ utvecklingen aktivt", color: "#d4982b" },
  { id: "avvakta", label: "Avvakta", blurb: "Omogen / hög osäkerhet", color: "#64718a" },
];

export const RING_BY_ID: Record<RingId, Ring> = Object.fromEntries(
  RINGS.map((ring) => [ring.id, ring]),
) as Record<RingId, Ring>;

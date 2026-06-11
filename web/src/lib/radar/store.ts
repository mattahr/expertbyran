import { unstable_cache } from "next/cache";

import type { RadarDetail, RadarMeta } from "@/lib/radar/schema";
import { getRadarStore } from "@/lib/stores";

export const RADAR_TAGS = ["radar"] as const;

// Lista (endast meta) och detalj (meta + blips) cachas separat så att
// listsidan inte drar in alla blips och detaljsidan inte hela katalogen.
const loadRadarList = unstable_cache(
  async (): Promise<RadarMeta[]> => getRadarStore().listRadars(),
  ["radar-list"],
  { tags: [...RADAR_TAGS] },
);

const loadRadarDetail = unstable_cache(
  async (slug: string): Promise<RadarDetail | null> => getRadarStore().getRadar(slug),
  ["radar-detail"],
  { tags: [...RADAR_TAGS] },
);

/** Radarkatalogen (endast meta), nyast först. */
export async function getRadarList(): Promise<RadarMeta[]> {
  return loadRadarList();
}

/** En radar med blips; cachas per slug. */
export async function getRadarDetail(slug: string): Promise<RadarDetail | null> {
  // Existens-gate mot den cachade listan — se kommentar i blog/store.ts.
  const radars = await loadRadarList();
  if (!radars.some((radar) => radar.slug === slug)) return null;
  return loadRadarDetail(slug);
}

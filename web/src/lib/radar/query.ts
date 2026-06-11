import type { RadarDetail, RadarMeta } from "@/lib/radar/schema";
import { getRadarDetail, getRadarList } from "@/lib/radar/store";

const radarDateFormatter = new Intl.DateTimeFormat("sv-SE", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatRadarDate(isoDate: string): string {
  return radarDateFormatter.format(new Date(isoDate));
}

/** Radarkatalogen (endast meta), nyast först. */
export async function getRadarArchive(): Promise<RadarMeta[]> {
  return getRadarList();
}

/** En radar med blips. */
export async function getRadar(slug: string): Promise<RadarDetail | null> {
  return getRadarDetail(slug);
}

import type { RadarDetail, RadarMeta } from "@/lib/radar/schema";
import { getRadarData } from "@/lib/radar/store";

export function formatRadarDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("sv-SE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function getRadarArchive(): Promise<RadarMeta[]> {
  const { radars } = await getRadarData();
  return radars
    .map((radar) => radar.meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getRadar(slug: string): Promise<RadarDetail | null> {
  const { radars } = await getRadarData();
  return radars.find((radar) => radar.meta.slug === slug) ?? null;
}

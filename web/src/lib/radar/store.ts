import { unstable_cache } from "next/cache";

import type { RadarDetail } from "@/lib/radar/schema";
import { getRadarStore } from "@/lib/stores";

export const RADAR_TAGS = ["radar"] as const;

const loadRadarData = unstable_cache(
  async (): Promise<{ radars: RadarDetail[] }> => {
    const store = getRadarStore();
    const metas = await store.listRadars();
    const radars = await Promise.all(
      metas.map(async (meta): Promise<RadarDetail> => {
        const full = await store.getRadar(meta.slug);
        return full ?? { meta, blips: [] };
      }),
    );
    return { radars };
  },
  ["radar-data"],
  { tags: [...RADAR_TAGS] },
);

export async function getRadarData(): Promise<{ radars: RadarDetail[] }> {
  return loadRadarData();
}

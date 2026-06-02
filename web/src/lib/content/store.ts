// web/src/lib/content/store.ts
import { unstable_cache } from "next/cache";

import type { SiteData } from "@/lib/content/schema";
import { getConfigStore, getContentStore } from "@/lib/stores";

export const CONTENT_TAGS = ["experts", "areas", "config"] as const;

const loadSiteData = unstable_cache(
  async (): Promise<SiteData> => {
    const config = await getConfigStore().getSiteConfig();
    const content = getContentStore();
    const [experts, expertAreas] = await Promise.all([
      content.listExperts(),
      content.listAreas(),
    ]);
    return { ...config, expertAreas, experts };
  },
  ["site-data"],
  { tags: [...CONTENT_TAGS] },
);

export async function getSiteData(): Promise<SiteData> {
  return loadSiteData();
}

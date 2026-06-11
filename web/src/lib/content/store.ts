// web/src/lib/content/store.ts
import { unstable_cache } from "next/cache";

import type { SiteData } from "@/lib/content/schema";
import { getConfigStore, getContentStore } from "@/lib/stores";
import type { SiteConfig } from "@/lib/stores/types";

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

/**
 * Endast config-delen (bundlad i imagen, ingen DB-läsning). Används av
 * layout/chrome så att de kan prerendras utan databas vid build.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  return getConfigStore().getSiteConfig();
}

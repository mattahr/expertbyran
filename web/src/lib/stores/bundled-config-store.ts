// web/src/lib/stores/bundled-config-store.ts
import siteConfigJson from "@/config/site-config.json";

import { parseSiteConfig } from "@/lib/content/schema";
import type { ConfigStore, SiteConfig } from "./types";

// Sajtkonfigen är kod, inte innehåll: den bundlas i imagen via statisk import
// och valideras en gång per process. Ändringar görs i repot och deployas.
let cached: SiteConfig | null = null;

export class BundledConfigStore implements ConfigStore {
  async getSiteConfig(): Promise<SiteConfig> {
    if (!cached) {
      cached = parseSiteConfig(siteConfigJson, "src/config/site-config.json");
    }
    return cached;
  }
}

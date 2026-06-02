// web/src/lib/stores/file-config-store.ts
import path from "node:path";

import { parseSiteData } from "@/lib/content/schema";
import type { ConfigStore, SiteConfig } from "./types";
import { readJsonFile, resolveDataDir } from "./fs-helpers";

export class FileConfigStore implements ConfigStore {
  private readonly file: string;

  constructor(dataDir: string = resolveDataDir()) {
    this.file = path.join(dataDir, "site-data.json");
  }

  async getSiteConfig(): Promise<SiteConfig> {
    const raw = await readJsonFile(this.file);
    const data = parseSiteData(raw, this.file);
    const { version, updatedAt, site, organization, marketplace } = data;
    return { version, updatedAt, site, organization, marketplace };
  }
}

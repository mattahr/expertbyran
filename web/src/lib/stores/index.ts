// web/src/lib/stores/index.ts
import type { BlogStore, ConfigStore, ContentStore, ForesightStore, RadarStore } from "./types";
import { BundledConfigStore } from "./bundled-config-store";
import { SqliteContentStore } from "./sqlite-content-store";
import { SqliteBlogStore } from "./sqlite-blog-store";
import { SqliteForesightStore } from "./sqlite-foresight-store";
import { SqliteRadarStore } from "./sqlite-radar-store";

type Stores = {
  config: ConfigStore;
  content: ContentStore;
  blog: BlogStore;
  foresight: ForesightStore;
  radar: RadarStore;
};

let override: Partial<Stores> | null = null;
let defaults: Stores | null = null;

function getDefaults(): Stores {
  if (!defaults) {
    defaults = {
      config: new BundledConfigStore(),
      content: new SqliteContentStore(),
      blog: new SqliteBlogStore(),
      foresight: new SqliteForesightStore(),
      radar: new SqliteRadarStore(),
    };
  }
  return defaults;
}

export function getConfigStore(): ConfigStore {
  return override?.config ?? getDefaults().config;
}
export function getContentStore(): ContentStore {
  return override?.content ?? getDefaults().content;
}
export function getBlogStore(): BlogStore {
  return override?.blog ?? getDefaults().blog;
}
export function getForesightStore(): ForesightStore {
  return override?.foresight ?? getDefaults().foresight;
}
export function getRadarStore(): RadarStore {
  return override?.radar ?? getDefaults().radar;
}

/** Endast för test: injicera in-memory-stores. */
export function __setStoresForTest(stores: Partial<Stores> | null): void {
  override = stores;
}

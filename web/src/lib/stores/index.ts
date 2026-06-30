// web/src/lib/stores/index.ts
import type {
  AnalyticsStore,
  BlogStore,
  ConfigStore,
  ContentStore,
  ForesightStore,
  RadarStore,
} from "./types";
import { BundledConfigStore } from "./bundled-config-store";
import { SqliteAnalyticsStore } from "./sqlite-analytics-store";
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
  analytics: AnalyticsStore;
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
      analytics: new SqliteAnalyticsStore(),
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
export function getAnalyticsStore(): AnalyticsStore {
  return override?.analytics ?? getDefaults().analytics;
}

/** Endast för test: injicera in-memory-stores. */
export function __setStoresForTest(stores: Partial<Stores> | null): void {
  override = stores;
}

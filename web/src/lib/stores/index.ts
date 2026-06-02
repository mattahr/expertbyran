// web/src/lib/stores/index.ts
import type { BlogStore, ConfigStore, ContentStore } from "./types";
import { FileConfigStore } from "./file-config-store";
import { FileContentStore } from "./file-content-store";
import { FileBlogStore } from "./file-blog-store";

type Stores = { config: ConfigStore; content: ContentStore; blog: BlogStore };

let override: Partial<Stores> | null = null;
let defaults: Stores | null = null;

function getDefaults(): Stores {
  if (!defaults) {
    defaults = {
      config: new FileConfigStore(),
      content: new FileContentStore(),
      blog: new FileBlogStore(),
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

/** Endast för test: injicera in-memory-stores. */
export function __setStoresForTest(stores: Partial<Stores> | null): void {
  override = stores;
}

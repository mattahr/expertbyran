// web/src/lib/stores/file-config-store.test.ts
// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import { FileConfigStore } from "./file-config-store";

let dir: string;

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "eb-config-"));
  await fs.writeFile(path.join(dir, "site-data.json"), JSON.stringify(siteData), "utf-8");
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("FileConfigStore", () => {
  it("läser config-delen utan experter/områden", async () => {
    const store = new FileConfigStore(dir);
    const config = await store.getSiteConfig();

    expect(config.site.name).toBe(siteData.site.name);
    expect(config.marketplace.name).toBe(siteData.marketplace.name);
    expect(config.version).toBe(siteData.version);
    expect((config as Record<string, unknown>).experts).toBeUndefined();
    expect((config as Record<string, unknown>).expertAreas).toBeUndefined();
  });
});

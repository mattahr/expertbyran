// web/src/lib/content/store.test.ts
// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import type { SiteData } from "@/lib/content/schema";
import { __setStoresForTest } from "@/lib/stores";
import { InMemoryConfigStore, InMemoryContentStore } from "@/lib/stores/memory-stores";
import { getSiteData } from "./store";

const data = siteData as unknown as SiteData;

afterEach(() => __setStoresForTest(null));

describe("getSiteData", () => {
  it("komponerar config + experter + områden från storarna", async () => {
    __setStoresForTest({
      config: new InMemoryConfigStore(data),
      content: new InMemoryContentStore(data.experts, data.expertAreas),
    });

    const result = await getSiteData();

    expect(result.site.name).toBe(data.site.name);
    expect(result.experts.length).toBe(data.experts.length);
    expect(result.expertAreas.length).toBe(data.expertAreas.length);
  });
});

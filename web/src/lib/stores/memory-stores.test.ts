// web/src/lib/stores/memory-stores.test.ts
// @vitest-environment node
import { describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import type { SiteData } from "@/lib/content/schema";
import {
  InMemoryBlogStore,
  InMemoryConfigStore,
  InMemoryContentStore,
} from "./memory-stores";
import { ConflictError, NotFoundError } from "./types";

const data = siteData as unknown as SiteData;

describe("InMemoryContentStore", () => {
  it("speglar fil-storens kontrakt", async () => {
    const store = new InMemoryContentStore(data.experts, data.expertAreas);
    expect((await store.listExperts()).length).toBe(data.experts.length);
    await expect(store.createExpert(data.experts[0])).rejects.toBeInstanceOf(ConflictError);
    await expect(store.deleteExpert("finns-inte")).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("InMemoryBlogStore", () => {
  it("skapar och hämtar inlägg", async () => {
    const store = new InMemoryBlogStore();
    await store.createPost(
      {
        slug: "x",
        title: "X",
        date: "2026-04-15T10:00:00.000Z",
        authorName: "A",
        areaSlugs: ["revisionsmetodik"],
        excerpt: "e",
      },
      "# X",
    );
    expect((await store.getPost("x"))?.markdown).toBe("# X");
  });
});

describe("InMemoryConfigStore", () => {
  it("returnerar config", async () => {
    const store = new InMemoryConfigStore(data);
    expect((await store.getSiteConfig()).site.name).toBe(data.site.name);
  });
});

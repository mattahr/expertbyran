// web/src/lib/blog/store.test.ts
// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";

import { __setStoresForTest } from "@/lib/stores";
import { InMemoryBlogStore } from "@/lib/stores/memory-stores";
import { getBlogData } from "./store";

afterEach(() => __setStoresForTest(null));

describe("getBlogData", () => {
  it("läser katalog och renderar markdown till HTML via BlogStore", async () => {
    const blog = new InMemoryBlogStore();
    await blog.createPost(
      {
        slug: "test",
        title: "Test",
        date: "2026-04-15T10:00:00.000Z",
        authorName: "A",
        areaSlugs: ["revisionsmetodik"],
        excerpt: "e",
      },
      "# Rubrik\n\nText.",
    );
    __setStoresForTest({ blog });

    const data = await getBlogData();

    expect(data.catalog.posts).toHaveLength(1);
    expect(data.renderedPosts.get("test")).toContain("<h1");
  });
});

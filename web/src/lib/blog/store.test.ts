// web/src/lib/blog/store.test.ts
// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";

import { __setStoresForTest } from "@/lib/stores";
import { InMemoryBlogStore } from "@/lib/stores/memory-stores";
import { getBlogCatalog, getRenderedPost } from "./store";

afterEach(() => __setStoresForTest(null));

async function seedPost(markdown = "# Rubrik\n\nText.") {
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
    markdown,
  );
  __setStoresForTest({ blog });
  return blog;
}

describe("getBlogCatalog", () => {
  it("läser katalogens metadata utan att rendera markdown", async () => {
    await seedPost();

    const catalog = await getBlogCatalog();

    expect(catalog.posts).toHaveLength(1);
    expect(catalog.posts[0]?.slug).toBe("test");
  });
});

describe("getRenderedPost", () => {
  it("renderar markdown till HTML för ett enskilt inlägg", async () => {
    await seedPost();

    expect(await getRenderedPost("test")).toContain("<h1");
  });

  it("returnerar null för ett inlägg som saknas", async () => {
    await seedPost();

    expect(await getRenderedPost("saknas")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import blogFixture from "@/test/fixtures/blog-data.fixture.json";

import { blogCatalogSchema } from "./schema";

describe("blogCatalogSchema", () => {
  it("accepts a valid blog catalog", () => {
    const result = blogCatalogSchema.safeParse(blogFixture);
    expect(result.success).toBe(true);
  });

  it("accepts an empty posts array", () => {
    const result = blogCatalogSchema.safeParse({ posts: [] });
    expect(result.success).toBe(true);
  });

  it("rejects duplicate post slugs", () => {
    const data = structuredClone(blogFixture);
    data.posts[1].slug = data.posts[0].slug;

    const result = blogCatalogSchema.safeParse(data);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path.join(".")).toBe("posts.1.slug");
      expect(result.error.issues[0]?.message).toContain("unik");
    }
  });

  it("rejects an invalid slug format", () => {
    const data = structuredClone(blogFixture);
    data.posts[0].slug = "Has Spaces";

    const result = blogCatalogSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid date format", () => {
    const data = structuredClone(blogFixture);
    data.posts[0].date = "not-a-date-at-all";

    const result = blogCatalogSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects a missing title", () => {
    const data = structuredClone(blogFixture);
    (data.posts[0] as Record<string, unknown>).title = "";

    const result = blogCatalogSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects empty areaSlugs", () => {
    const data = structuredClone(blogFixture);
    data.posts[0].areaSlugs = [];

    const result = blogCatalogSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("accepts a post with only authorName (no authorSlug)", () => {
    const result = blogCatalogSchema.safeParse({
      posts: [
        {
          slug: "gastinlagg",
          title: "Gästinlägg",
          date: "2026-04-22T08:00:00.000Z",
          authorName: "Anna Andersson",
          authorRole: "Gästskribent",
          areaSlugs: ["revisionsmetodik"],
          excerpt: "Ett gästinlägg utan matchande expert.",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a post with authorSlug only (klassisk modell)", () => {
    const result = blogCatalogSchema.safeParse({
      posts: [
        {
          slug: "expertinlagg",
          title: "Expertinlägg",
          date: "2026-04-22T08:00:00.000Z",
          authorSlug: "effektivitetsrevisor",
          areaSlugs: ["revisionsmetodik"],
          excerpt: "Ett inlägg av en känd expert.",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a post without both authorSlug and authorName", () => {
    const result = blogCatalogSchema.safeParse({
      posts: [
        {
          slug: "utan-forfattare",
          title: "Utan författare",
          date: "2026-04-22T08:00:00.000Z",
          areaSlugs: ["revisionsmetodik"],
          excerpt: "Saknar författareinformation helt.",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

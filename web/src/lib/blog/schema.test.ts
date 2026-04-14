import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import blogFixture from "@/test/fixtures/blog-data.fixture.json";

import { blogCatalogSchema } from "./schema";

describe("blogCatalogSchema", () => {
  it("accepts a valid blog catalog", () => {
    const result = blogCatalogSchema.safeParse(blogFixture);
    expect(result.success).toBe(true);
  });

  it("validerar den faktiska blog-data.json mot schemat", () => {
    const raw = readFileSync(path.join(process.cwd(), "blog-data.json"), "utf-8");
    const data = JSON.parse(raw);
    const result = blogCatalogSchema.safeParse(data);
    if (!result.success) {
      // Skriv ut eventuella fel för enkel felsökning
      const issues = result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
      expect.fail(`blog-data.json klarar inte schemat:\n${issues}`);
    }
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
});

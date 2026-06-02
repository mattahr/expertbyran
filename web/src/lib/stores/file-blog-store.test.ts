// web/src/lib/stores/file-blog-store.test.ts
// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { FileBlogStore } from "./file-blog-store";
import { ConflictError, NotFoundError } from "./types";

let dir: string;
let store: FileBlogStore;

const META = {
  slug: "test-inlagg",
  title: "Testinlägg",
  date: "2026-04-15T10:00:00.000Z",
  authorName: "Anna Andersson",
  areaSlugs: ["revisionsmetodik"],
  excerpt: "Sammanfattning.",
};

beforeEach(async () => {
  dir = await fs.mkdtemp(path.join(os.tmpdir(), "eb-blog-"));
  await fs.writeFile(path.join(dir, "blog-data.json"), JSON.stringify({ posts: [] }), "utf-8");
  store = new FileBlogStore(dir);
});

afterEach(async () => {
  await fs.rm(dir, { recursive: true, force: true });
});

describe("FileBlogStore", () => {
  it("skapar, hämtar, uppdaterar och tar bort ett inlägg", async () => {
    await store.createPost(META, "# Rubrik\n\nText.");

    const list = await store.listPosts();
    expect(list).toHaveLength(1);

    const got = await store.getPost("test-inlagg");
    expect(got?.meta.title).toBe("Testinlägg");
    expect(got?.markdown).toContain("# Rubrik");

    await store.updatePost("test-inlagg", { markdown: "# Ny\n\nNytt." });
    expect((await store.getPost("test-inlagg"))?.markdown).toContain("# Ny");

    await store.deletePost("test-inlagg");
    expect(await store.getPost("test-inlagg")).toBeNull();
    await expect(fs.access(path.join(dir, "blog", "posts", "test-inlagg.md"))).rejects.toThrow();
  });

  it("kastar ConflictError för dubbletter och NotFoundError för okänd slug", async () => {
    await store.createPost(META, "x");
    await expect(store.createPost(META, "y")).rejects.toBeInstanceOf(ConflictError);
    await expect(store.deletePost("finns-inte")).rejects.toBeInstanceOf(NotFoundError);
  });
});

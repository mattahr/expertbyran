// web/src/lib/db/import-legacy.test.ts
// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import siteData from "@/test/fixtures/site-data.fixture.json";
import { openDatabase } from "@/lib/db/client";
import { SqliteBlogStore } from "@/lib/stores/sqlite-blog-store";
import { importLegacyData } from "./import-legacy";

let dataDir: string;

beforeEach(async () => {
  dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "eb-import-"));
});

afterEach(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

async function writeLegacyFiles() {
  await fs.writeFile(path.join(dataDir, "site-data.json"), JSON.stringify(siteData));

  const posts = [
    {
      slug: "forsta-inlagget",
      title: "Första inlägget",
      date: "2026-01-02T10:00:00.000Z",
      authorName: "Testförfattare",
      areaSlugs: [(siteData.expertAreas[0] as { slug: string }).slug],
      excerpt: "Utdrag.",
    },
    {
      slug: "andra-inlagget",
      title: "Andra inlägget",
      date: "2026-01-01T10:00:00.000Z",
      authorName: "Testförfattare",
      areaSlugs: [(siteData.expertAreas[0] as { slug: string }).slug],
      excerpt: "Utdrag.",
    },
  ];
  await fs.writeFile(path.join(dataDir, "blog-data.json"), JSON.stringify({ posts }));
  await fs.mkdir(path.join(dataDir, "blog", "posts"), { recursive: true });
  for (const post of posts) {
    await fs.writeFile(
      path.join(dataDir, "blog", "posts", `${post.slug}.md`),
      `# ${post.title}\n\nBrödtext med å, ä, ö.`,
    );
  }

  const foresights = [
    {
      slug: "digital-framtid",
      title: "Digital framtid",
      date: "2026-02-01T10:00:00.000Z",
      authorName: "Chefsstrateg",
      areaSlugs: [(siteData.expertAreas[0] as { slug: string }).slug],
      excerpt: "Utdrag.",
    },
  ];
  await fs.writeFile(path.join(dataDir, "foresight-data.json"), JSON.stringify({ foresights }));
  await fs.mkdir(path.join(dataDir, "foresight"), { recursive: true });
  await fs.writeFile(path.join(dataDir, "foresight", "digital-framtid.md"), "# Framtid");

  const radars = [
    {
      slug: "teknikradar",
      title: "Teknikradar",
      date: "2026-03-01T10:00:00.000Z",
      segments: [
        { id: "verktyg", name: "Verktyg" },
        { id: "metoder", name: "Metoder" },
        { id: "plattformar", name: "Plattformar" },
        { id: "tekniker", name: "Tekniker" },
      ],
    },
  ];
  await fs.writeFile(path.join(dataDir, "radar-data.json"), JSON.stringify({ radars }));
  await fs.mkdir(path.join(dataDir, "radar"), { recursive: true });
  await fs.writeFile(
    path.join(dataDir, "radar", "teknikradar.json"),
    JSON.stringify({
      blips: [
        {
          id: "ai-granskning",
          name: "AI-granskning",
          segmentId: "metoder",
          ring: "prova",
          description: "Beskrivning.",
          implications: "Implikationer.",
        },
      ],
    }),
  );
}

describe("importLegacyData", () => {
  it("importerar alla samlingar, renderar HTML och döper om källfilerna", async () => {
    await writeLegacyFiles();
    const db = openDatabase(":memory:");

    await importLegacyData(db, dataDir);

    const counts = db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM blog_posts) AS blog,
           (SELECT COUNT(*) FROM foresights) AS foresights,
           (SELECT COUNT(*) FROM radars) AS radars,
           (SELECT COUNT(*) FROM experts) AS experts,
           (SELECT COUNT(*) FROM expert_areas) AS areas`,
      )
      .get() as Record<string, number>;
    expect(counts.blog).toBe(2);
    expect(counts.foresights).toBe(1);
    expect(counts.radars).toBe(1);
    expect(counts.experts).toBe((siteData.experts as unknown[]).length);
    expect(counts.areas).toBe((siteData.expertAreas as unknown[]).length);

    // HTML renderad vid import
    const stored = await new SqliteBlogStore(db).getPost("forsta-inlagget");
    expect(stored?.html).toContain("<h1");
    expect(stored?.html).toContain("å, ä, ö");

    // Källfilerna omdöpta — inte raderade
    const entries = await fs.readdir(dataDir);
    expect(entries).toContain("blog-data.json.imported");
    expect(entries).toContain("site-data.json.imported");
    expect(entries).not.toContain("blog-data.json");
    expect(await fs.readdir(path.join(dataDir, "blog"))).toContain("posts.imported");
  });

  it("är idempotent — andra körningen gör ingenting", async () => {
    await writeLegacyFiles();
    const db = openDatabase(":memory:");
    await importLegacyData(db, dataDir);
    await importLegacyData(db, dataDir);
    expect((db.prepare("SELECT COUNT(*) AS n FROM blog_posts").get() as { n: number }).n).toBe(2);
  });

  it("avbryter och lämnar källfiler orörda om ett inlägg saknar markdownfil", async () => {
    await writeLegacyFiles();
    await fs.rm(path.join(dataDir, "blog", "posts", "andra-inlagget.md"));
    const db = openDatabase(":memory:");

    await expect(importLegacyData(db, dataDir)).rejects.toThrow();

    // Bloggtabellen återställd till tom; katalogfilen kvar utan .imported-suffix
    expect((db.prepare("SELECT COUNT(*) AS n FROM blog_posts").get() as { n: number }).n).toBe(0);
    expect(await fs.readdir(dataDir)).toContain("blog-data.json");
  });

  it("hoppar över allt när SKIP_LEGACY_IMPORT=1", async () => {
    await writeLegacyFiles();
    const db = openDatabase(":memory:");
    process.env.SKIP_LEGACY_IMPORT = "1";
    try {
      await importLegacyData(db, dataDir);
    } finally {
      delete process.env.SKIP_LEGACY_IMPORT;
    }
    expect((db.prepare("SELECT COUNT(*) AS n FROM blog_posts").get() as { n: number }).n).toBe(0);
    expect(await fs.readdir(dataDir)).toContain("blog-data.json");
  });
});

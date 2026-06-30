// @vitest-environment node
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { openDatabase } from "@/lib/db/client";
import { SqliteAnalyticsStore } from "@/lib/stores/sqlite-analytics-store";
import { importLegacyVisits } from "./import-legacy-visits";

function tmpDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "visits-test-"));
}

describe("importLegacyVisits", () => {
  it("importerar JSONL till SQLite, hoppar korrupta rader och döper om filen", async () => {
    const dir = await tmpDir();
    const vdir = path.join(dir, "visits");
    await fs.mkdir(vdir, { recursive: true });
    const lines = [
      JSON.stringify({ timestamp: "2026-05-05T08:00:00.000Z", path: "/a", ip: "193.13.0.1", userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36", referer: "", lang: "sv-SE" }),
      JSON.stringify({ timestamp: "2026-05-05T09:00:00.000Z", path: "/b", ip: "8.8.8.8", userAgent: "curl/8.1", referer: "https://google.com/", lang: "en" }),
      "{ inte giltig json",
    ].join("\n");
    await fs.writeFile(path.join(vdir, "visits-2026-05-05.jsonl"), lines, "utf-8");

    const db = openDatabase(":memory:");
    const n = await importLegacyVisits(db, dir);
    expect(n).toBe(2);

    const store = new SqliteAnalyticsStore(db);
    const overview = store.overview({ from: "2026-05-01", to: "2026-05-31", excludeBots: false });
    expect(overview.summary.pageviews).toBe(2);
    expect(overview.topPages.map((p) => p.path).sort()).toEqual(["/a", "/b"]);

    const files = await fs.readdir(vdir);
    expect(files).toContain("visits-2026-05-05.jsonl.imported");
    expect(files).not.toContain("visits-2026-05-05.jsonl");

    // Idempotent: andra körningen hittar ingen .jsonl kvar
    expect(await importLegacyVisits(db, dir)).toBe(0);

    await fs.rm(dir, { recursive: true, force: true });
  });

  it("returnerar 0 när visits-katalog saknas", async () => {
    const dir = await tmpDir();
    const db = openDatabase(":memory:");
    expect(await importLegacyVisits(db, dir)).toBe(0);
    await fs.rm(dir, { recursive: true, force: true });
  });
});

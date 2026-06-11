// web/src/lib/db/import-legacy.ts
//
// Automatisk engångsimport av det gamla filbaserade formatet (JSON + markdown
// på DATA_DIR-volymen) till SQLite. Körs vid serverstart, innan servern tar
// emot trafik: varje samling importeras bara om dess tabeller är tomma OCH
// legacy-filerna finns. Hela samlingen skrivs i EN transaktion — en krasch
// eller hård kill mitt i lämnar tabellen tom (rollback), aldrig halvfylld.
// Efter lyckad och antalsverifierad samling döps källfilerna om till
// *.imported — de raderas aldrig. Misslyckas en samling avbryts uppstarten;
// redan committade samlingar är då redan omdöpta och hoppar över sig själva
// vid nästa försök. Nödventil: SKIP_LEGACY_IMPORT=1 hoppar över hela importen.
import fs from "node:fs/promises";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

import { parseBlogCatalog } from "@/lib/blog/schema";
import { parseForesightCatalog } from "@/lib/foresight/schema";
import { parseRadarBlips, parseRadarCatalog } from "@/lib/radar/schema";
import { parseSiteData } from "@/lib/content/schema";
import { withTransactionAsync } from "@/lib/db/client";
import { readJsonFile, readTextFile } from "@/lib/stores/fs-helpers";
import { SqliteBlogStore } from "@/lib/stores/sqlite-blog-store";
import { SqliteContentStore } from "@/lib/stores/sqlite-content-store";
import { SqliteForesightStore } from "@/lib/stores/sqlite-foresight-store";
import { SqliteRadarStore } from "@/lib/stores/sqlite-radar-store";

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function tableCount(db: DatabaseSync, table: string): number {
  return (db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
}

async function readMarkdownOrThrow(filePath: string, slug: string): Promise<string> {
  const markdown = await readTextFile(filePath);
  if (!markdown.trim()) {
    throw new Error(`[import] Tom markdownfil för '${slug}' (${filePath}) — avbryter importen.`);
  }
  return markdown;
}

async function markImported(paths: string[]): Promise<void> {
  for (const sourcePath of paths) {
    if (!(await fileExists(sourcePath))) continue;
    let target = `${sourcePath}.imported`;
    if (await fileExists(target)) {
      // Skriv aldrig tyst över en tidigare importmarkering.
      target = `${sourcePath}.imported-${Date.now()}`;
      console.warn(`[import] ${sourcePath}.imported fanns redan — använder ${target}`);
    }
    try {
      await fs.rename(sourcePath, target);
    } catch (error) {
      // Importen är redan genomförd och verifierad — en misslyckad omdöpning
      // får inte fälla uppstarten, men nästa boot kommer att varna.
      console.warn(`[import] Kunde inte döpa om ${sourcePath}`, error);
    }
  }
}

async function importContent(db: DatabaseSync, dataDir: string): Promise<number | null> {
  const file = path.join(dataDir, "site-data.json");
  if (!(await fileExists(file))) return null;
  if (tableCount(db, "experts") > 0 || tableCount(db, "expert_areas") > 0) {
    console.warn(
      `[import] ${file} finns men experts/expert_areas är inte tomma — hoppar över (hantera manuellt).`,
    );
    return null;
  }

  const data = parseSiteData(await readJsonFile(file), file);
  const store = new SqliteContentStore(db);
  await withTransactionAsync(db, async () => {
    for (const area of data.expertAreas) await store.createArea(area);
    for (const expert of data.experts) await store.createExpert(expert);
    if (
      tableCount(db, "experts") !== data.experts.length ||
      tableCount(db, "expert_areas") !== data.expertAreas.length
    ) {
      throw new Error(`[import] Antalsverifiering misslyckades för ${file}`);
    }
  });

  await markImported([file]);
  return data.expertAreas.length + data.experts.length;
}

async function importBlog(db: DatabaseSync, dataDir: string): Promise<number | null> {
  const catalogFile = path.join(dataDir, "blog-data.json");
  if (!(await fileExists(catalogFile))) return null;
  if (tableCount(db, "blog_posts") > 0) {
    console.warn(
      `[import] ${catalogFile} finns men blog_posts är inte tom — hoppar över (hantera manuellt).`,
    );
    return null;
  }

  const catalog = parseBlogCatalog(await readJsonFile(catalogFile), catalogFile);
  const postsDir = path.join(dataDir, "blog", "posts");
  const store = new SqliteBlogStore(db);
  await withTransactionAsync(db, async () => {
    for (const post of catalog.posts) {
      const markdownPath = path.join(postsDir, `${post.slug}.md`);
      await store.createPost(post, await readMarkdownOrThrow(markdownPath, post.slug));
    }
    if (tableCount(db, "blog_posts") !== catalog.posts.length) {
      throw new Error(`[import] Antalsverifiering misslyckades för ${catalogFile}`);
    }
  });

  await markImported([catalogFile, postsDir]);
  return catalog.posts.length;
}

async function importForesight(db: DatabaseSync, dataDir: string): Promise<number | null> {
  const catalogFile = path.join(dataDir, "foresight-data.json");
  if (!(await fileExists(catalogFile))) return null;
  if (tableCount(db, "foresights") > 0) {
    console.warn(
      `[import] ${catalogFile} finns men foresights är inte tom — hoppar över (hantera manuellt).`,
    );
    return null;
  }

  const catalog = parseForesightCatalog(await readJsonFile(catalogFile), catalogFile);
  const postsDir = path.join(dataDir, "foresight");
  const store = new SqliteForesightStore(db);
  await withTransactionAsync(db, async () => {
    for (const entry of catalog.foresights) {
      const markdownPath = path.join(postsDir, `${entry.slug}.md`);
      await store.createForesight(entry, await readMarkdownOrThrow(markdownPath, entry.slug));
    }
    if (tableCount(db, "foresights") !== catalog.foresights.length) {
      throw new Error(`[import] Antalsverifiering misslyckades för ${catalogFile}`);
    }
  });

  await markImported([catalogFile, postsDir]);
  return catalog.foresights.length;
}

async function importRadar(db: DatabaseSync, dataDir: string): Promise<number | null> {
  const catalogFile = path.join(dataDir, "radar-data.json");
  if (!(await fileExists(catalogFile))) return null;
  if (tableCount(db, "radars") > 0) {
    console.warn(
      `[import] ${catalogFile} finns men radars är inte tom — hoppar över (hantera manuellt).`,
    );
    return null;
  }

  const catalog = parseRadarCatalog(await readJsonFile(catalogFile), catalogFile);
  const radarsDir = path.join(dataDir, "radar");
  const store = new SqliteRadarStore(db);
  await withTransactionAsync(db, async () => {
    for (const meta of catalog.radars) {
      const blipsFile = path.join(radarsDir, `${meta.slug}.json`);
      const { blips } = parseRadarBlips(await readJsonFile(blipsFile), blipsFile);
      await store.createRadar(meta, blips);
    }
    if (tableCount(db, "radars") !== catalog.radars.length) {
      throw new Error(`[import] Antalsverifiering misslyckades för ${catalogFile}`);
    }
  });

  await markImported([catalogFile, radarsDir]);
  return catalog.radars.length;
}

export async function importLegacyData(db: DatabaseSync, dataDir: string): Promise<void> {
  if (process.env.SKIP_LEGACY_IMPORT === "1") {
    console.log("[import] SKIP_LEGACY_IMPORT=1 — hoppar över legacy-import");
    return;
  }

  const results: [string, number | null][] = [
    ["experter/områden", await importContent(db, dataDir)],
    ["blogg", await importBlog(db, dataDir)],
    ["foresight", await importForesight(db, dataDir)],
    ["radar", await importRadar(db, dataDir)],
  ];

  const performed = results.filter(([, count]) => count !== null);
  if (performed.length === 0) return;

  for (const [name, count] of performed) {
    console.log(`[import] ${name}: ${count} poster importerade till SQLite`);
  }
  console.log(
    "[import] Klart. Om en persistent Next-cache återanvänds från tidigare drift: anropa GET /refresh (med bearer-token) för att invalidera gamla cacheposter.",
  );
}

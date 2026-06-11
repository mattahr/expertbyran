// web/src/lib/db/import-legacy.ts
//
// Automatisk engångsimport av det gamla filbaserade formatet (JSON + markdown
// på DATA_DIR-volymen) till SQLite. Körs vid serverstart: varje samling
// importeras bara om dess tabeller är tomma OCH legacy-filerna finns. Efter
// lyckad och verifierad import döps källfilerna om till *.imported — de
// raderas aldrig. Misslyckas importen återställs samlingens tabeller till
// tomma och uppstarten avbryts hellre än att gå live med ofullständig data.
// Nödventil: SKIP_LEGACY_IMPORT=1 hoppar över hela importen.
import fs from "node:fs/promises";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

import { parseBlogCatalog } from "@/lib/blog/schema";
import { parseForesightCatalog } from "@/lib/foresight/schema";
import { parseRadarBlips, parseRadarCatalog } from "@/lib/radar/schema";
import { parseSiteData } from "@/lib/content/schema";
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

async function markImported(paths: string[]): Promise<void> {
  for (const sourcePath of paths) {
    if (!(await fileExists(sourcePath))) continue;
    try {
      await fs.rename(sourcePath, `${sourcePath}.imported`);
    } catch (error) {
      // Importen är redan genomförd och verifierad — en misslyckad omdöpning
      // får inte fälla uppstarten, men nästa boot kommer att varna.
      console.warn(`[import] Kunde inte döpa om ${sourcePath} till .imported`, error);
    }
  }
}

type CollectionResult = { imported: number; renamed: string[] } | null;

async function importContent(db: DatabaseSync, dataDir: string): Promise<CollectionResult> {
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
  try {
    for (const area of data.expertAreas) await store.createArea(area);
    for (const expert of data.experts) await store.createExpert(expert);
  } catch (error) {
    db.exec("DELETE FROM experts; DELETE FROM expert_areas;");
    throw error;
  }

  const imported = data.expertAreas.length + data.experts.length;
  if (
    tableCount(db, "experts") !== data.experts.length ||
    tableCount(db, "expert_areas") !== data.expertAreas.length
  ) {
    db.exec("DELETE FROM experts; DELETE FROM expert_areas;");
    throw new Error(`[import] Antalsverifiering misslyckades för ${file}`);
  }
  return { imported, renamed: [file] };
}

async function importBlog(db: DatabaseSync, dataDir: string): Promise<CollectionResult> {
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
  try {
    for (const post of catalog.posts) {
      const markdown = await readTextFile(path.join(postsDir, `${post.slug}.md`));
      await store.createPost(post, markdown);
    }
  } catch (error) {
    db.exec("DELETE FROM blog_posts;");
    throw error;
  }

  if (tableCount(db, "blog_posts") !== catalog.posts.length) {
    db.exec("DELETE FROM blog_posts;");
    throw new Error(`[import] Antalsverifiering misslyckades för ${catalogFile}`);
  }
  return { imported: catalog.posts.length, renamed: [catalogFile, postsDir] };
}

async function importForesight(db: DatabaseSync, dataDir: string): Promise<CollectionResult> {
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
  try {
    for (const entry of catalog.foresights) {
      const markdown = await readTextFile(path.join(postsDir, `${entry.slug}.md`));
      await store.createForesight(entry, markdown);
    }
  } catch (error) {
    db.exec("DELETE FROM foresights;");
    throw error;
  }

  if (tableCount(db, "foresights") !== catalog.foresights.length) {
    db.exec("DELETE FROM foresights;");
    throw new Error(`[import] Antalsverifiering misslyckades för ${catalogFile}`);
  }
  return { imported: catalog.foresights.length, renamed: [catalogFile, postsDir] };
}

async function importRadar(db: DatabaseSync, dataDir: string): Promise<CollectionResult> {
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
  try {
    for (const meta of catalog.radars) {
      const blipsFile = path.join(radarsDir, `${meta.slug}.json`);
      const { blips } = parseRadarBlips(await readJsonFile(blipsFile), blipsFile);
      await store.createRadar(meta, blips);
    }
  } catch (error) {
    db.exec("DELETE FROM radars;");
    throw error;
  }

  if (tableCount(db, "radars") !== catalog.radars.length) {
    db.exec("DELETE FROM radars;");
    throw new Error(`[import] Antalsverifiering misslyckades för ${catalogFile}`);
  }
  return { imported: catalog.radars.length, renamed: [catalogFile, radarsDir] };
}

export async function importLegacyData(db: DatabaseSync, dataDir: string): Promise<void> {
  if (process.env.SKIP_LEGACY_IMPORT === "1") {
    console.log("[import] SKIP_LEGACY_IMPORT=1 — hoppar över legacy-import");
    return;
  }

  const results = [
    ["experter/områden", await importContent(db, dataDir)],
    ["blogg", await importBlog(db, dataDir)],
    ["foresight", await importForesight(db, dataDir)],
    ["radar", await importRadar(db, dataDir)],
  ] as const;

  const performed = results.filter(([, result]) => result !== null) as [
    string,
    NonNullable<CollectionResult>,
  ][];
  if (performed.length === 0) return;

  // Allt verifierat — markera källfilerna som konsumerade.
  await markImported(performed.flatMap(([, result]) => result.renamed));
  for (const [name, result] of performed) {
    console.log(`[import] ${name}: ${result.imported} poster importerade till SQLite`);
  }
}

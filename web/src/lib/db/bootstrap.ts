// web/src/lib/db/bootstrap.ts
import { MARKDOWN_RENDERER_VERSION } from "@/lib/blog/markdown";
import { loadGeo } from "@/lib/geo";
import { resolveDataDir } from "@/lib/stores/fs-helpers";
import { getDb } from "./client";
import { importLegacyData } from "./import-legacy";
import { importLegacyVisits } from "./import-legacy-visits";

/** Körs vid serverstart: öppnar DB (migrerar), förvärmer geo, importerar legacy. */
export async function ensureDatabaseReady(): Promise<void> {
  const db = getDb();
  const dataDir = resolveDataDir();

  // Förvärm geo-läsaren före importen så att legacy-besök kan geo-kodas.
  await loadGeo();

  await importLegacyData(db, dataDir);

  if (process.env.SKIP_LEGACY_IMPORT !== "1") {
    try {
      const n = await importLegacyVisits(db, dataDir);
      if (n > 0) console.log(`[db] importerade ${n} äldre besök från JSONL till SQLite`);
    } catch (error) {
      // Besöksimport får aldrig stoppa uppstarten.
      console.error("[db] kunde inte importera äldre besök:", error);
    }
  }

  const stale = (
    db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM blog_posts WHERE renderer_version <> ?) +
           (SELECT COUNT(*) FROM foresights WHERE renderer_version <> ?) AS n`,
      )
      .get(MARKDOWN_RENDERER_VERSION, MARKDOWN_RENDERER_VERSION) as { n: number }
  ).n;
  if (stale > 0) {
    console.warn(
      `[db] ${stale} poster har HTML renderad med äldre renderarversion — kör POST /api/v1/rerender för att rendera om.`,
    );
  }
}

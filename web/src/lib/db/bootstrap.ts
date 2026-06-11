// web/src/lib/db/bootstrap.ts
import { MARKDOWN_RENDERER_VERSION } from "@/lib/blog/markdown";
import { resolveDataDir } from "@/lib/stores/fs-helpers";
import { getDb } from "./client";
import { importLegacyData } from "./import-legacy";

/** Körs vid serverstart: öppnar DB (migrerar), importerar ev. legacy-data. */
export async function ensureDatabaseReady(): Promise<void> {
  const db = getDb();
  await importLegacyData(db, resolveDataDir());

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

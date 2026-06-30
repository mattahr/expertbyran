// web/src/lib/db/import-legacy-visits.ts
//
// Engångsimport av det gamla JSONL-baserade besöksloggen till SQLite. Körs vid
// boot; importerade filer döps om till *.imported (idempotent).
import fs from "node:fs/promises";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

import { buildVisit } from "@/lib/analytics/build-visit";
import { getOrCreateSecret } from "@/lib/settings";
import { SqliteAnalyticsStore } from "@/lib/stores/sqlite-analytics-store";

interface LegacyEntry {
  timestamp?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  lang?: string;
}

export async function importLegacyVisits(db: DatabaseSync, dataDir: string): Promise<number> {
  const dir = path.join(dataDir, "visits");
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.startsWith("visits-") && f.endsWith(".jsonl"));
  } catch {
    return 0; // ingen visits-katalog → inget att importera
  }
  if (files.length === 0) return 0;

  const store = new SqliteAnalyticsStore(db);
  const salt = process.env.VISITOR_SALT?.trim() || getOrCreateSecret("visitor_salt", db);
  let imported = 0;

  for (const file of files.sort()) {
    const full = path.join(dir, file);
    let content: string;
    try {
      content = await fs.readFile(full, "utf-8");
    } catch {
      continue;
    }
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      let entry: LegacyEntry;
      try {
        entry = JSON.parse(trimmed) as LegacyEntry;
      } catch {
        continue; // hoppa över korrupta rader
      }
      if (!entry.path || !entry.timestamp) continue;
      const now = Date.parse(entry.timestamp);
      if (Number.isNaN(now)) continue;

      store.record(
        buildVisit({
          payload: { path: entry.path, referrer: entry.referer ?? null, lang: entry.lang ?? null },
          now,
          ip: entry.ip ?? "",
          uaRaw: entry.userAgent ?? null,
          clientHints: {},
          headerCountry: null,
          ownHost: null,
          visitorSalt: salt,
        }),
      );
      imported++;
    }
    await fs.rename(full, `${full}.imported`).catch(() => {});
  }

  return imported;
}

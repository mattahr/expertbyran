// web/src/lib/db/import-legacy-visits.ts
//
// Engångsimport av den gamla JSONL-baserade besöksloggen till SQLite. Körs vid
// boot. Idempotent och krasch-säker: importerar bara mot tom tabell, skriver
// alla rader i EN transaktion, och döper därefter om källfilerna till
// *.imported (samma skyddsmönster som innehålls-importen).
import fs from "node:fs/promises";
import path from "node:path";
import type { DatabaseSync } from "node:sqlite";

import { buildVisit } from "@/lib/analytics/build-visit";
import { withTransaction } from "@/lib/db/client";
import { getOrCreateSecret } from "@/lib/settings";
import { SqliteAnalyticsStore } from "@/lib/stores/sqlite-analytics-store";
import type { VisitInsert } from "@/lib/stores/types";

interface LegacyEntry {
  timestamp?: string;
  path?: string;
  ip?: string;
  userAgent?: string;
  referer?: string;
  lang?: string;
}

export async function importLegacyVisits(db: DatabaseSync, dataDir: string): Promise<number> {
  // Idempotens-/krasch-skydd: importera bara om tabellen är tom. Om en tidigare
  // import committat rader men kraschade innan filerna döptes om, hoppas allt
  // över här i stället för att skapa dubbletter.
  const existing = (db.prepare("SELECT COUNT(*) AS n FROM visits").get() as { n: number }).n;
  if (existing > 0) return 0;

  const dir = path.join(dataDir, "visits");
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.startsWith("visits-") && f.endsWith(".jsonl"));
  } catch {
    return 0; // ingen visits-katalog → inget att importera
  }
  if (files.length === 0) return 0;

  const salt = process.env.VISITOR_SALT?.trim() || getOrCreateSecret("visitor_salt", db);

  // Läs och parsa allt FÖRST (async I/O utanför transaktionen).
  const visits: VisitInsert[] = [];
  const sources: string[] = [];
  for (const file of files.sort()) {
    const full = path.join(dir, file);
    let content: string;
    try {
      content = await fs.readFile(full, "utf-8");
    } catch {
      continue;
    }
    sources.push(full);
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

      visits.push(
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
    }
  }

  // Skriv atomiskt: antingen alla rader eller inga.
  if (visits.length > 0) {
    const store = new SqliteAnalyticsStore(db);
    withTransaction(db, () => {
      for (const v of visits) store.record(v);
    });
  }

  // Döp om källfilerna så de inte läses om (best-effort; tom-tabell-gardet ovan
  // skyddar mot dubbletter även om en omdöpning skulle misslyckas).
  for (const full of sources) {
    await fs.rename(full, `${full}.imported`).catch(() => {});
  }

  return visits.length;
}

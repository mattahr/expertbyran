// @vitest-environment node
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";

import { runMigrations } from "./migrations";

// Bygger en databas i det skick den hade INNAN ring-migreringen: schemat utan
// rings-kolumn och med migrering 1–3 markerade som applicerade, plus en befintlig
// radar-rad. Då kör runMigrations bara den nya ring-migreringen.
function dbAtPreRings(): DatabaseSync {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
    INSERT INTO schema_migrations (version, name, applied_at) VALUES
      (1, 'grundschema', '2026-01-01T00:00:00.000Z'),
      (2, 'besoksstatistik', '2026-01-01T00:00:00.000Z'),
      (3, 'namngivna-besokare', '2026-01-01T00:00:00.000Z');

    CREATE TABLE radars (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      version TEXT,
      date TEXT NOT NULL,
      date_ms INTEGER NOT NULL,
      segments TEXT NOT NULL,
      blips TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    INSERT INTO radars (slug, title, subtitle, version, date, date_ms, segments, blips, updated_at)
    VALUES (
      'gammal',
      'Gammal radar',
      NULL,
      NULL,
      '2026-01-01T00:00:00.000Z',
      1767225600000,
      '[{"id":"a","name":"A"},{"id":"b","name":"B"},{"id":"c","name":"C"},{"id":"d","name":"D"}]',
      '[]',
      '2026-01-01T00:00:00.000Z'
    );
  `);
  return db;
}

describe("ring-migrering", () => {
  it("lägger till rings-kolumnen och backfillar befintliga radarer med standardringar", () => {
    const db = dbAtPreRings();

    runMigrations(db);

    const row = db.prepare("SELECT rings FROM radars WHERE slug = 'gammal'").get() as {
      rings: string | null;
    };
    expect(row.rings).toBeTruthy();
    const rings = JSON.parse(row.rings as string) as { id: string }[];
    expect(rings.map((r) => r.id)).toEqual(["anta", "prova", "bevaka", "avvakta"]);
  });
});

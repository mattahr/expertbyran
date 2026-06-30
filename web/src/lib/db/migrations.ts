// web/src/lib/db/migrations.ts
//
// Idempotenta schema-migreringar. Varje migrering körs i en transaktion och
// registreras i schema_migrations; vid nyinstallation skapas hela schemat mot
// en tom databas (inga seeds — innehåll kommer via API:t eller legacy-importen).
import type { DatabaseSync } from "node:sqlite";

type Migration = {
  version: number;
  name: string;
  up: (db: DatabaseSync) => void;
};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: "grundschema",
    up(db) {
      db.exec(`
        CREATE TABLE blog_posts (
          slug TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          date TEXT NOT NULL,
          date_ms INTEGER NOT NULL,
          author_slug TEXT,
          author_name TEXT,
          author_role TEXT,
          excerpt TEXT NOT NULL,
          area_slugs TEXT NOT NULL,
          markdown TEXT NOT NULL,
          html TEXT NOT NULL,
          renderer_version INTEGER NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_blog_posts_date ON blog_posts(date_ms DESC);

        CREATE TABLE blog_post_areas (
          post_slug TEXT NOT NULL REFERENCES blog_posts(slug) ON DELETE CASCADE ON UPDATE CASCADE,
          area_slug TEXT NOT NULL,
          PRIMARY KEY (post_slug, area_slug)
        );
        CREATE INDEX idx_blog_post_areas_area ON blog_post_areas(area_slug, post_slug);

        CREATE TABLE foresights (
          slug TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          date TEXT NOT NULL,
          date_ms INTEGER NOT NULL,
          author_slug TEXT,
          author_name TEXT,
          author_role TEXT,
          excerpt TEXT NOT NULL,
          horizon TEXT,
          area_slugs TEXT NOT NULL,
          markdown TEXT NOT NULL,
          html TEXT NOT NULL,
          renderer_version INTEGER NOT NULL,
          updated_at TEXT NOT NULL
        );
        CREATE INDEX idx_foresights_date ON foresights(date_ms DESC);

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
        CREATE INDEX idx_radars_date ON radars(date_ms DESC);

        CREATE TABLE experts (
          slug TEXT PRIMARY KEY,
          data TEXT NOT NULL
        );

        CREATE TABLE expert_areas (
          slug TEXT PRIMARY KEY,
          data TEXT NOT NULL
        );
      `);
    },
  },
  {
    version: 2,
    name: "besoksstatistik",
    up(db) {
      db.exec(`
        CREATE TABLE visits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ts INTEGER NOT NULL,
          day TEXT NOT NULL,
          hour INTEGER NOT NULL,
          path TEXT NOT NULL,
          referrer_full TEXT,
          referrer_host TEXT,
          source TEXT NOT NULL,
          utm_source TEXT,
          utm_medium TEXT,
          utm_campaign TEXT,
          country TEXT,
          country_name TEXT,
          ip TEXT NOT NULL,
          visitor_id TEXT NOT NULL,
          ua_raw TEXT,
          browser TEXT,
          browser_version TEXT,
          os TEXT,
          os_version TEXT,
          device TEXT NOT NULL,
          device_brand TEXT,
          device_model TEXT,
          is_bot INTEGER NOT NULL DEFAULT 0,
          lang TEXT,
          languages TEXT,
          timezone TEXT,
          screen_w INTEGER,
          screen_h INTEGER,
          viewport_w INTEGER,
          viewport_h INTEGER,
          dpr REAL
        );
        CREATE INDEX idx_visits_ts ON visits(ts DESC);
        CREATE INDEX idx_visits_day ON visits(day);
        CREATE INDEX idx_visits_path ON visits(path);
        CREATE INDEX idx_visits_country ON visits(country);
        CREATE INDEX idx_visits_visitor ON visits(visitor_id);
        CREATE INDEX idx_visits_is_bot ON visits(is_bot);

        CREATE TABLE settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);
    },
  },
  {
    version: 3,
    name: "namngivna-besokare",
    up(db) {
      db.exec(`
        CREATE TABLE visitor_labels (
          visitor_id TEXT PRIMARY KEY,
          label TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
    },
  },
  {
    version: 4,
    name: "radar-ringar",
    up(db) {
      // Ringar blir per-radar-data (parallellt med segments). Befintliga radarer
      // backfillas med standarduppsättningen — vars id (anta/prova/bevaka/avvakta)
      // matchar de ringar blips redan refererar, så integriteten bevaras.
      db.exec(`
        ALTER TABLE radars ADD COLUMN rings TEXT;
        UPDATE radars
        SET rings = '[{"id":"anta","label":"Anta","blurb":"I drift, hög mognad","color":"#0e7c7b"},{"id":"prova","label":"Pröva","blurb":"Pilot, bygg kompetens","color":"#1d4e74"},{"id":"bevaka","label":"Bevaka","blurb":"Följ utvecklingen aktivt","color":"#d4982b"},{"id":"avvakta","label":"Avvakta","blurb":"Omogen / hög osäkerhet","color":"#64718a"}]'
        WHERE rings IS NULL;
      `);
    },
  },
];

export function runMigrations(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    (db.prepare("SELECT version FROM schema_migrations").all() as { version: number }[]).map(
      (row) => row.version,
    ),
  );

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) continue; // snabbväg utan lås
    db.exec("BEGIN IMMEDIATE;");
    try {
      // Omkontroll under write-locken: en annan process (överlappande
      // containrar mot samma volym) kan ha applicerat migreringen mellan
      // applied-läsningen ovan och BEGIN IMMEDIATE.
      const row = db
        .prepare("SELECT 1 FROM schema_migrations WHERE version = ?")
        .get(migration.version);
      if (row) {
        db.exec("COMMIT;");
        continue;
      }
      migration.up(db);
      db.prepare("INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)").run(
        migration.version,
        migration.name,
        new Date().toISOString(),
      );
      db.exec("COMMIT;");
      console.log(`[db] Migrering ${migration.version} (${migration.name}) applicerad`);
    } catch (error) {
      db.exec("ROLLBACK;");
      throw error;
    }
  }
}

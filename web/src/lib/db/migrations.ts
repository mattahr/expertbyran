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
    if (applied.has(migration.version)) continue;
    db.exec("BEGIN IMMEDIATE;");
    try {
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

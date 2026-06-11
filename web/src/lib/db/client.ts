// web/src/lib/db/client.ts
//
// SQLite-klient via Nodes inbyggda node:sqlite (DatabaseSync).
// Vald framför better-sqlite3 för att Docker-imagen byggs på alpine (musl)
// men körs på distroless Debian (glibc) — native-binärer från builder-steget
// kraschar i runnern, medan node:sqlite är inbyggd och saknar beroenden.
//
// OBS: DatabaseSync är synkron — varje query blockerar event-loopen. Vid
// nuvarande frågestorlekar (indexerade lookups, sub-ms) är det oproblematiskt,
// men framtida tunga frågor (t.ex. FTS5-sök) måste tidsbudgeteras.
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

import { resolveDataDir } from "@/lib/stores/fs-helpers";
import { runMigrations } from "./migrations";

export const DB_FILENAME = "expertbyran.db";

let db: DatabaseSync | null = null;

export function openDatabase(filePath: string): DatabaseSync {
  const database = new DatabaseSync(filePath);
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA synchronous = NORMAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA busy_timeout = 5000;");
  runMigrations(database);
  return database;
}

/** Process-singleton mot ${DATA_DIR}/expertbyran.db. */
export function getDb(): DatabaseSync {
  if (!db) {
    const dataDir = resolveDataDir();
    fs.mkdirSync(dataDir, { recursive: true });
    db = openDatabase(path.join(dataDir, DB_FILENAME));
  }
  return db;
}

/** Endast för test: stäng och nollställ singletonen. */
export function __resetDbForTest(): void {
  db?.close();
  db = null;
}

// web/src/lib/settings.ts
//
// Enkel key/value-lagring i SQLite för persisterade hemligheter (sessionssecret,
// visitor-salt). db injiceras valfritt (testbarhet), annars process-singletonen.
import crypto from "node:crypto";
import type { DatabaseSync } from "node:sqlite";

import { getDb } from "@/lib/db/client";

export function getSetting(key: string, db: DatabaseSync = getDb()): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as
    | { value: string }
    | undefined;
  return row ? row.value : null;
}

export function setSetting(key: string, value: string, db: DatabaseSync = getDb()): void {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, value);
}

/**
 * Returnerar en persisterad slumphemlighet för `key`, eller genererar och
 * sparar en ny (32 byte hex) första gången. Stabil över anrop och omstarter.
 */
export function getOrCreateSecret(key: string, db: DatabaseSync = getDb()): string {
  const existing = getSetting(key, db);
  if (existing) return existing;
  const secret = crypto.randomBytes(32).toString("hex");
  setSetting(key, secret, db);
  return secret;
}

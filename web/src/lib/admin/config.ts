// web/src/lib/admin/config.ts
//
// Env-läsning för admin/sessioner/insamling. Hemligheter faller tillbaka på
// persisterade slumpvärden i settings-tabellen när env saknas.
import { getOrCreateSecret } from "@/lib/settings";

export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME?.trim() || "admin";
}

export function getSessionSecret(): string {
  const env = process.env.ADMIN_SESSION_SECRET?.trim();
  if (env) return env;
  return getOrCreateSecret("session_secret");
}

export function getSessionTtlMs(): number {
  const days = Number(process.env.SESSION_TTL_DAYS);
  const valid = Number.isFinite(days) && days > 0 ? days : 7;
  return valid * 24 * 60 * 60 * 1000;
}

export function getVisitorSalt(): string {
  const env = process.env.VISITOR_SALT?.trim();
  if (env) return env;
  return getOrCreateSecret("visitor_salt");
}

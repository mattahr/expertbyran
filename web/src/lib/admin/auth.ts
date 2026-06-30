// web/src/lib/admin/auth.ts
//
// Credential-verifiering (timing-säker) och en enkel in-memory rate limit för
// inloggningsförsök. Sessions-/secret-hantering ligger i session.ts/config.ts.
import crypto from "node:crypto";

import { getAdminUsername } from "./config";

function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedPass) return false;
  const expectedUser = getAdminUsername();
  // Utvärdera båda jämförelserna (ingen tidig retur) för att inte läcka vilken som fel.
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; windowStart: number }>();

/** Returnerar true om försöket är tillåtet, false om gränsen passerats. */
export function checkRateLimit(ip: string, now: number): boolean {
  const key = ip || "unknown";
  const rec = attempts.get(key);
  if (!rec || now - rec.windowStart >= WINDOW_MS) {
    attempts.set(key, { count: 1, windowStart: now });
    return true;
  }
  rec.count++;
  return rec.count <= MAX_ATTEMPTS;
}

/** Nollställer räknaren för en IP (anropas efter lyckad inloggning). */
export function clearRateLimit(ip: string): void {
  attempts.delete(ip || "unknown");
}

export function resetRateLimitForTest(): void {
  attempts.clear();
}

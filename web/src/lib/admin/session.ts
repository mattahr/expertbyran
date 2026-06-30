// web/src/lib/admin/session.ts
//
// HMAC-signerade adminsessioner. Token: v1.<base64url(payload)>.<base64url(hmac)>
// där payload = { sub:"admin", iat, exp }. Verifiering är timing-säker och
// kontrollerar utgångstid. `now` injiceras för testbarhet.

import crypto from "node:crypto";

const PREFIX = "v1";

interface SessionPayload {
  sub: "admin";
  iat: number;
  exp: number;
}

function sign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(secret: string, ttlMs: number, now: number): string {
  const payload: SessionPayload = { sub: "admin", iat: now, exp: now + ttlMs };
  const body = `${PREFIX}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
  return `${body}.${sign(body, secret)}`;
}

export function verifySessionToken(
  token: string | undefined | null,
  secret: string,
  now: number,
): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== PREFIX) return false;

  const body = `${parts[0]}.${parts[1]}`;
  const expected = Buffer.from(sign(body, secret));
  const provided = Buffer.from(parts[2]);
  if (provided.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(provided, expected)) return false;

  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8")) as SessionPayload;
    return typeof payload.exp === "number" && payload.exp > now;
  } catch {
    return false;
  }
}

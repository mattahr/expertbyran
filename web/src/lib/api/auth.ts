import type { NextRequest } from "next/server";

import { getSessionSecret } from "@/lib/admin/config";
import { verifySessionToken } from "@/lib/admin/session";

/** Cookienamn för adminsessionen. */
export const ADMIN_COOKIE = "eb_admin";

export type AuthResult = { ok: true; via: "bearer" | "cookie" } | { ok: false };

/** Godkänner antingen maskin-bearer (API_TOKEN) eller en giltig adminsession. */
export function requireAdmin(req: NextRequest): AuthResult {
  if (requireAuth(req)) return { ok: true, via: "bearer" };

  const cookie = req.cookies.get(ADMIN_COOKIE)?.value;
  if (cookie && verifySessionToken(cookie, getSessionSecret(), Date.now())) {
    return { ok: true, via: "cookie" };
  }
  return { ok: false };
}

/**
 * CSRF-skydd för cookie-autentiserade mutationer: kräver att Origin-headern
 * matchar requestens egen värd. Bearer-flödet (maskin) behöver inte detta.
 */
export function assertSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host =
    req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  return Boolean(host) && originHost === host;
}

export function requireAuth(req: NextRequest): boolean {
  const API_TOKEN = process.env.API_TOKEN;
  if (!API_TOKEN) {
    console.error("[api-auth] API_TOKEN environment variable not set");
    return false;
  }

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return false;
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return false;
  }

  return token === API_TOKEN;
}

export function createUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    {
      status: 401,
      headers: { "content-type": "application/json" },
    },
  );
}

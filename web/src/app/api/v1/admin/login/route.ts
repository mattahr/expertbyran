// web/src/app/api/v1/admin/login/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";

import { checkRateLimit, clearRateLimit, verifyCredentials } from "@/lib/admin/auth";
import { adminEnabled, getSessionSecret, getSessionTtlMs } from "@/lib/admin/config";
import { createSessionToken } from "@/lib/admin/session";
import { ADMIN_COOKIE } from "@/lib/api/auth";
import { clientIp } from "@/lib/api/client-ip";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  username: z.string().min(1).max(256),
  password: z.string().min(1).max(1024),
});

export async function POST(req: NextRequest) {
  if (!adminEnabled()) {
    return Response.json(
      { error: "Admin är inte konfigurerad (ADMIN_PASSWORD saknas)" },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (!checkRateLimit(ip, Date.now())) {
    return Response.json({ error: "För många försök, vänta en stund" }, { status: 429 });
  }

  let body: z.infer<typeof loginSchema>;
  try {
    body = loginSchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Ogiltig begäran" }, { status: 400 });
  }

  if (!verifyCredentials(body.username, body.password)) {
    return Response.json({ error: "Fel användarnamn eller lösenord" }, { status: 401 });
  }

  clearRateLimit(ip);
  const ttlMs = getSessionTtlMs();
  const token = createSessionToken(getSessionSecret(), ttlMs, Date.now());
  const maxAge = Math.floor(ttlMs / 1000);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  const res = Response.json({ success: true });
  res.headers.set(
    "Set-Cookie",
    `${ADMIN_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`,
  );
  return res;
}

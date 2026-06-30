// web/src/lib/admin/server-session.ts
//
// Server-side sessionskontroll för RSC (admin-layouten). Läser cookien via
// next/headers och verifierar HMAC-signaturen.
import { cookies } from "next/headers";

import { ADMIN_COOKIE } from "@/lib/api/auth";
import { getSessionSecret } from "./config";
import { verifySessionToken } from "./session";

export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token, getSessionSecret(), Date.now());
}

// web/src/app/api/v1/admin/logout/route.ts
import { ADMIN_COOKIE } from "@/lib/api/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = Response.json({ success: true });
  res.headers.set("Set-Cookie", `${ADMIN_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  return res;
}

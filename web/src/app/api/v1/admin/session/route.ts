// web/src/app/api/v1/admin/session/route.ts
import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/api/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return Response.json({ authenticated: requireAdmin(req).ok });
}

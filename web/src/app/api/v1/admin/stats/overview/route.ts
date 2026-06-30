// web/src/app/api/v1/admin/stats/overview/route.ts
import { NextRequest } from "next/server";

import { parseStatsRange } from "@/lib/admin/stats-params";
import { requireAdmin } from "@/lib/api/auth";
import { getAnalyticsStore } from "@/lib/stores";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req).ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = getAnalyticsStore();
  const range = parseStatsRange(req.nextUrl.searchParams, Date.now(), store.earliestDay());
  return Response.json(store.overview(range));
}

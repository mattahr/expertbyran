// web/src/app/api/v1/admin/visitor-labels/route.ts
import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/api/auth";
import { getAnalyticsStore } from "@/lib/stores";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!requireAdmin(req).ok) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ labels: getAnalyticsStore().listVisitorLabels() });
}

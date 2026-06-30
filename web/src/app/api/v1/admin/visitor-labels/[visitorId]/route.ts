// web/src/app/api/v1/admin/visitor-labels/[visitorId]/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";

import { requireAdminMutation } from "@/lib/api/auth";
import { getAnalyticsStore } from "@/lib/stores";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ visitorId: string }> };

const bodySchema = z.object({ label: z.string().trim().min(1).max(120) });

export async function PUT(req: NextRequest, context: RouteContext) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  const { visitorId } = await context.params;

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return Response.json({ error: "Namnet måste vara 1–120 tecken" }, { status: 400 });
  }

  getAnalyticsStore().setVisitorLabel(visitorId, body.label);
  return Response.json({ success: true, data: { visitorId, label: body.label } });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  const { visitorId } = await context.params;
  getAnalyticsStore().deleteVisitorLabel(visitorId);
  return Response.json({ success: true });
}

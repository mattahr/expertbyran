// web/src/app/api/v1/areas/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAdminMutation } from "@/lib/api/auth";
import type { ExpertArea } from "@/lib/content/schema";
import { getContentStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const areas = await getContentStore().listAreas();
    return Response.json({ areas });
  } catch (error) {
    console.error("[api] Failed to read areas", error);
    return Response.json({ error: "Failed to read areas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  try {
    const area = (await req.json()) as ExpertArea;
    const created = await getContentStore().createArea(area);
    revalidateTag("areas", "max");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create area", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create area" },
      { status: 400 },
    );
  }
}

// web/src/app/api/v1/areas/[slug]/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { ExpertArea } from "@/lib/content/schema";
import { getContentStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const area = await getContentStore().getArea(slug);
    if (!area) {
      return Response.json({ error: `Area with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json(area);
  } catch (error) {
    console.error("[api] Failed to read area", error);
    return Response.json({ error: "Failed to read area" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    const updated = (await req.json()) as ExpertArea;
    const result = await getContentStore().updateArea(slug, updated);
    revalidateTag("areas", "max");
    return Response.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update area", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update area" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    await getContentStore().deleteArea(slug);
    revalidateTag("areas", "max");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete area", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete area" },
      { status: 400 },
    );
  }
}

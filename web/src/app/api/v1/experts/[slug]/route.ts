// web/src/app/api/v1/experts/[slug]/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { Expert } from "@/lib/content/schema";
import { getContentStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const expert = await getContentStore().getExpert(slug);
    if (!expert) {
      return Response.json({ error: `Expert with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json(expert);
  } catch (error) {
    console.error("[api] Failed to read expert", error);
    return Response.json({ error: "Failed to read expert" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    const updated = (await req.json()) as Expert;
    const result = await getContentStore().updateExpert(slug, updated);
    revalidateTag("experts", "max");
    return Response.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update expert", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update expert" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    await getContentStore().deleteExpert(slug);
    revalidateTag("experts", "max");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete expert", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete expert" },
      { status: 400 },
    );
  }
}

import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAdminMutation } from "@/lib/api/auth";
import type { ForesightEntry } from "@/lib/foresight/schema";
import { getForesightStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const result = await getForesightStore().getForesight(slug);
    if (!result) {
      return Response.json({ error: `Foresight with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json({ foresight: result.meta, markdown: result.markdown });
  } catch (error) {
    console.error("[api] Failed to read foresight", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to read foresight" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  try {
    const { slug } = await context.params;
    const { foresight, markdown } = (await req.json()) as {
      foresight?: ForesightEntry;
      markdown?: string;
    };
    const updated = await getForesightStore().updateForesight(slug, { meta: foresight, markdown });
    const full = await getForesightStore().getForesight(updated.slug);
    revalidateTag("foresight", "max");
    return Response.json({
      success: true,
      data: { foresight: updated, markdown: full?.markdown ?? "" },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update foresight", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update foresight" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  try {
    const { slug } = await context.params;
    await getForesightStore().deleteForesight(slug);
    revalidateTag("foresight", "max");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete foresight", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete foresight" },
      { status: 400 },
    );
  }
}

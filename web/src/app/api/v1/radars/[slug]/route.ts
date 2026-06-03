import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import { blipSchema, radarMetaSchema } from "@/lib/radar/schema";
import { getRadarStore } from "@/lib/stores";
import { ConflictError, NotFoundError } from "@/lib/stores/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

const radarPatchSchema = z.object({
  meta: radarMetaSchema.optional(),
  blips: z.array(blipSchema).optional(),
});

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const result = await getRadarStore().getRadar(slug);
    if (!result) {
      return Response.json({ error: `Radar with slug ${slug} not found` }, { status: 404 });
    }
    return Response.json({ meta: result.meta, blips: result.blips });
  } catch (error) {
    console.error("[api] Failed to read radar", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to read radar" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    const parsed = radarPatchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid radar payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const updated = await getRadarStore().updateRadar(slug, {
      meta: parsed.data.meta,
      blips: parsed.data.blips,
    });
    const full = await getRadarStore().getRadar(updated.slug);
    revalidateTag("radar", "max");
    return Response.json({ success: true, data: { meta: updated, blips: full?.blips ?? [] } });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to update radar", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to update radar" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { slug } = await context.params;
    await getRadarStore().deleteRadar(slug);
    revalidateTag("radar", "max");
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    console.error("[api] Failed to delete radar", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete radar" },
      { status: 400 },
    );
  }
}

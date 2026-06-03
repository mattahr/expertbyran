import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { ForesightEntry } from "@/lib/foresight/schema";
import { getForesightStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const foresights = await getForesightStore().listForesights();
    return Response.json({ foresights });
  } catch (error) {
    console.error("[api] Failed to read foresights", error);
    return Response.json({ error: "Failed to read foresights" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  try {
    const { foresight, markdown } = (await req.json()) as {
      foresight: ForesightEntry;
      markdown: string;
    };
    if (!foresight || !markdown) {
      return Response.json(
        { error: "Both 'foresight' metadata and 'markdown' content are required" },
        { status: 400 },
      );
    }
    const created = await getForesightStore().createForesight(foresight, markdown);
    revalidateTag("foresight", "max");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create foresight", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create foresight" },
      { status: 400 },
    );
  }
}

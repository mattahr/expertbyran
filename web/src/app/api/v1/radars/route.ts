import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAdminMutation } from "@/lib/api/auth";
import { radarInputSchema } from "@/lib/radar/schema";
import { getRadarStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const radars = await getRadarStore().listRadars();
    return Response.json({ radars });
  } catch (error) {
    console.error("[api] Failed to read radars", error);
    return Response.json({ error: "Failed to read radars" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  try {
    const parsed = radarInputSchema.safeParse(await req.json());
    if (!parsed.success) {
      return Response.json(
        { error: "Invalid radar payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const created = await getRadarStore().createRadar(parsed.data.meta, parsed.data.blips);
    revalidateTag("radar", "max");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create radar", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create radar" },
      { status: 400 },
    );
  }
}

// web/src/app/api/v1/experts/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAdminMutation } from "@/lib/api/auth";
import type { Expert } from "@/lib/content/schema";
import { getContentStore } from "@/lib/stores";
import { ConflictError } from "@/lib/stores/types";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const experts = await getContentStore().listExperts();
    return Response.json({ experts });
  } catch (error) {
    console.error("[api] Failed to read experts", error);
    return Response.json({ error: "Failed to read experts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdminMutation(req);
  if (denied) return denied;
  try {
    const expert = (await req.json()) as Expert;
    const created = await getContentStore().createExpert(expert);
    revalidateTag("experts", "max");
    return Response.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    if (error instanceof ConflictError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    console.error("[api] Failed to create expert", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create expert" },
      { status: 400 },
    );
  }
}

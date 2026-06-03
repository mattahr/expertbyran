// web/src/app/refresh/route.ts
import { revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

const TAGS = ["experts", "areas", "blog", "radar"] as const;

export async function GET() {
  for (const tag of TAGS) revalidateTag(tag, "max");
  return Response.json(
    { ok: true, invalidated: TAGS, refreshedAt: new Date().toISOString() },
    { headers: { "cache-control": "no-store" } },
  );
}

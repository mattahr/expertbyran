// web/src/app/refresh/route.ts
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import { BLOG_TAGS } from "@/lib/blog/store";
import { CONTENT_TAGS } from "@/lib/content/store";
import { FORESIGHT_TAGS } from "@/lib/foresight/store";
import { RADAR_TAGS } from "@/lib/radar/store";

export const dynamic = "force-dynamic";

// Härledd från modulernas taggkonstanter så att listan inte driftar.
const TAGS = [...new Set([...CONTENT_TAGS, ...BLOG_TAGS, ...RADAR_TAGS, ...FORESIGHT_TAGS])];

// Nödventil för out-of-band-ändringar (t.ex. direkt i databasen). Kräver
// samma bearer-token som skrivvägen — oautentiserad var den en gratis
// cache-bust-förstärkare för vem som helst.
export async function GET(req: NextRequest) {
  if (!requireAuth(req)) return createUnauthorizedResponse();
  for (const tag of TAGS) revalidateTag(tag, "max");
  return Response.json(
    { ok: true, invalidated: TAGS, refreshedAt: new Date().toISOString() },
    { headers: { "cache-control": "no-store" } },
  );
}

import { NextRequest } from "next/server";
import { readSiteDataFromDisk, writeSiteDataToDisk } from "@/lib/storage/disk-storage";
import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { Expert } from "@/lib/content/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const siteData = await readSiteDataFromDisk();
    return Response.json({ experts: siteData.experts });
  } catch (error) {
    console.error("[api] Failed to read experts", error);
    return new Response(
      JSON.stringify({ error: "Failed to read experts" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!requireAuth(req)) {
    return createUnauthorizedResponse();
  }

  try {
    const expert = await req.json() as Expert;
    const siteData = await readSiteDataFromDisk();

    // Check if expert already exists
    if (siteData.experts.some((e) => e.slug === expert.slug)) {
      return new Response(
        JSON.stringify({ error: `Expert with slug ${expert.slug} already exists` }),
        { status: 409, headers: { "content-type": "application/json" } },
      );
    }

    siteData.experts.push(expert);
    siteData.updatedAt = new Date().toISOString();
    await writeSiteDataToDisk(siteData);

    return Response.json({ success: true, data: expert }, { status: 201 });
  } catch (error) {
    console.error("[api] Failed to create expert", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to create expert" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
}

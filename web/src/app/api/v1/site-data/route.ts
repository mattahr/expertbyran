import { NextRequest } from "next/server";
import { readSiteDataFromDisk, writeSiteDataToDisk } from "@/lib/storage/disk-storage";
import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import { parseSiteData } from "@/lib/content/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await readSiteDataFromDisk();
    return Response.json(data);
  } catch (error) {
    console.error("[api] Failed to read site-data", error);
    return new Response(
      JSON.stringify({ error: "Failed to read site-data" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!requireAuth(req)) {
    return createUnauthorizedResponse();
  }

  try {
    const body = await req.json();
    const validated = parseSiteData(body, "api-put");
    await writeSiteDataToDisk(validated);
    return Response.json({ success: true, data: validated });
  } catch (error) {
    console.error("[api] Failed to write site-data", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to write site-data" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
}

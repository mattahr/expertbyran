import { NextRequest } from "next/server";
import { readSiteDataFromDisk, writeSiteDataToDisk } from "@/lib/storage/disk-storage";
import { requireAuth, createUnauthorizedResponse } from "@/lib/api/auth";
import type { Expert } from "@/lib/content/schema";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const siteData = await readSiteDataFromDisk();
    const expert = siteData.experts.find((e) => e.slug === slug);

    if (!expert) {
      return new Response(
        JSON.stringify({ error: `Expert with slug ${slug} not found` }),
        { status: 404, headers: { "content-type": "application/json" } },
      );
    }

    return Response.json(expert);
  } catch (error) {
    console.error("[api] Failed to read expert", error);
    return new Response(
      JSON.stringify({ error: "Failed to read expert" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) {
    return createUnauthorizedResponse();
  }

  try {
    const { slug } = await context.params;
    const updatedExpert = await req.json() as Expert;
    const siteData = await readSiteDataFromDisk();

    const index = siteData.experts.findIndex((e) => e.slug === slug);

    if (index === -1) {
      return new Response(
        JSON.stringify({ error: `Expert with slug ${slug} not found` }),
        { status: 404, headers: { "content-type": "application/json" } },
      );
    }

    // Preserve slug if not changing
    if (updatedExpert.slug !== slug) {
      // Check if new slug already exists
      if (siteData.experts.some((e) => e.slug === updatedExpert.slug)) {
        return new Response(
          JSON.stringify({ error: `Expert with slug ${updatedExpert.slug} already exists` }),
          { status: 409, headers: { "content-type": "application/json" } },
        );
      }
    }

    siteData.experts[index] = updatedExpert;
    siteData.updatedAt = new Date().toISOString();
    await writeSiteDataToDisk(siteData);

    return Response.json({ success: true, data: updatedExpert });
  } catch (error) {
    console.error("[api] Failed to update expert", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to update expert" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  if (!requireAuth(req)) {
    return createUnauthorizedResponse();
  }

  try {
    const { slug } = await context.params;
    const siteData = await readSiteDataFromDisk();

    const index = siteData.experts.findIndex((e) => e.slug === slug);

    if (index === -1) {
      return new Response(
        JSON.stringify({ error: `Expert with slug ${slug} not found` }),
        { status: 404, headers: { "content-type": "application/json" } },
      );
    }

    siteData.experts.splice(index, 1);
    siteData.updatedAt = new Date().toISOString();
    await writeSiteDataToDisk(siteData);

    return Response.json({ success: true });
  } catch (error) {
    console.error("[api] Failed to delete expert", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to delete expert" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
}

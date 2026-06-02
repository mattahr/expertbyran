// web/src/app/api/v1/site-data/route.ts
import { getSiteData } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getSiteData();
    return Response.json(data);
  } catch (error) {
    console.error("[api] Failed to read site-data", error);
    return Response.json({ error: "Failed to read site-data" }, { status: 500 });
  }
}

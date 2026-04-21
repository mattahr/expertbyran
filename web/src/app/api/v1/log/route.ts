import { NextRequest } from "next/server";
import { appendVisit, type VisitEntry } from "@/lib/storage/visit-log";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body: VisitEntry = await req.json();
    // Sätt IP server-side — klienten kan inte veta sin egen IP
    body.ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      ?? req.headers.get("x-real-ip")
      ?? "";
    await appendVisit(body);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[api/log] Failed to log visit", error);
    return new Response(null, { status: 500 });
  }
}

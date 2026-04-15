import type { NextRequest } from "next/server";

const API_TOKEN = process.env.API_TOKEN;

export function requireAuth(req: NextRequest): boolean {
  if (!API_TOKEN) {
    console.error("[api-auth] API_TOKEN environment variable not set");
    return false;
  }

  const authHeader = req.headers.get("authorization");

  if (!authHeader) {
    return false;
  }

  const [type, token] = authHeader.split(" ");

  if (type !== "Bearer" || !token) {
    return false;
  }

  return token === API_TOKEN;
}

export function createUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: "Unauthorized" }),
    {
      status: 401,
      headers: { "content-type": "application/json" },
    },
  );
}

import { NextRequest, NextResponse } from "next/server";

import { xRobotsTagValue } from "@/lib/robots-policy";

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  response.headers.set("x-robots-tag", xRobotsTagValue);

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|schemas).*)",
};

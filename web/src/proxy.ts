import { NextRequest, NextResponse } from "next/server";

import { xRobotsTagValue } from "@/lib/robots-policy";

export function proxy(request: NextRequest) {
  // Vidarebefordra sökvägen som request-header så server-komponenter (SiteChrome)
  // kan särbehandla /admin utan publik chrome.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("x-pathname", request.nextUrl.pathname);
  response.headers.set("x-robots-tag", xRobotsTagValue);
  // Be Chromium-klienter skicka plattform/version/mobil-hints på efterföljande
  // requests (berikar UA-parsningen i /api/v1/track).
  response.headers.set("Accept-CH", "Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Mobile");

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|schemas).*)",
};

// @vitest-environment node

import type { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { xRobotsTagValue } from "@/lib/robots-policy";

import { proxy } from "./proxy";

describe("proxy", () => {
  it("adds routing and robots headers to every proxied response", () => {
    const request = {
      nextUrl: new URL("https://expertbyran.ai/blogg/test-post"),
    } as NextRequest;

    const response = proxy(request);

    expect(response.headers.get("x-pathname")).toBe("/blogg/test-post");
    expect(response.headers.get("x-robots-tag")).toBe(xRobotsTagValue);
  });
});

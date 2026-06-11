// web/src/app/refresh/route.test.ts
// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";

import { GET } from "./route";

const ORIGINAL_TOKEN = process.env.API_TOKEN;

beforeEach(() => {
  process.env.API_TOKEN = "test-token";
});

afterEach(() => {
  process.env.API_TOKEN = ORIGINAL_TOKEN;
  vi.mocked(revalidateTag).mockClear();
});

function request(authorization?: string) {
  return new NextRequest("http://localhost/refresh", {
    headers: authorization ? { authorization } : {},
  });
}

describe("GET /refresh", () => {
  it("kräver bearer-token", async () => {
    const response = await GET(request());
    expect(response.status).toBe(401);
    expect(vi.mocked(revalidateTag)).not.toHaveBeenCalled();
  });

  it("avvisar fel token", async () => {
    const response = await GET(request("Bearer fel-token"));
    expect(response.status).toBe(401);
  });

  it("invaliderar samtliga innehållstaggar med korrekt token", async () => {
    const response = await GET(request("Bearer test-token"));
    const body = await response.json();

    expect(body.ok).toBe(true);
    for (const tag of ["experts", "areas", "config", "blog", "radar", "foresight"]) {
      expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith(tag, "max");
    }
  });
});

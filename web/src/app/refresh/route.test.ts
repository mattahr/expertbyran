// web/src/app/refresh/route.test.ts
// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { revalidateTag } from "next/cache";

import { GET } from "./route";

describe("GET /refresh", () => {
  it("invaliderar innehållstaggarna och svarar ok", async () => {
    const response = await GET();
    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("experts");
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("areas");
    expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("blog");
  });
});

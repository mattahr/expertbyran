import React from "react";

import { vi } from "vitest";

vi.mock("next/cache", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/cache")>();

  return {
    ...actual,
    revalidateTag: vi.fn(),
    unstable_cache: (callback: (...args: unknown[]) => unknown) => callback,
  };
});

vi.mock("next/image", () => ({
  default: function MockImage(props: React.ComponentProps<"img">) {
    return React.createElement("img", props);
  },
}));

vi.mock("next/link", () => ({
  default: function MockLink({
    href,
    children,
    ...rest
  }: React.ComponentProps<"a"> & { href: string }) {
    return React.createElement("a", { href, ...rest }, children);
  },
}));

// @vitest-environment jsdom

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReadingProgress } from "./ReadingProgress";

describe("ReadingProgress", () => {
  it("renderar ett tomt progress-element med width 0", () => {
    const { container } = render(<ReadingProgress />);
    const bar = container.querySelector("[data-testid='reading-progress-bar']") as HTMLElement;
    expect(bar).toBeDefined();
    expect(bar.style.width).toBe("0%");
  });

  it("uppdaterar bredden vid scroll", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 2000, configurable: true });
    Object.defineProperty(document.documentElement, "clientHeight", { value: 1000, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 500, writable: true, configurable: true });

    const { container } = render(<ReadingProgress />);
    fireEvent.scroll(window);

    const bar = container.querySelector("[data-testid='reading-progress-bar']") as HTMLElement;
    expect(bar.style.width).toBe("50%");
  });
});

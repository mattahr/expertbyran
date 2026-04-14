// @vitest-environment jsdom

import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StatCounter } from "./StatCounter";

describe("StatCounter", () => {
  let callback: IntersectionObserverCallback | null;

  beforeEach(() => {
    callback = null;
    vi.useFakeTimers({ toFake: ["setTimeout", "setInterval", "requestAnimationFrame", "performance"] });

    class MockObserver implements IntersectionObserver {
      readonly root: Element | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords(): IntersectionObserverEntry[] {
        return [];
      }
    }
    vi.stubGlobal("IntersectionObserver", MockObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("renderar slutvärdet direkt om IntersectionObserver saknas", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(<StatCounter value={42} />);
    expect(container.textContent).toBe("42");
  });

  it("startar på 0 och animerar till slutvärdet", async () => {
    const { container } = render(<StatCounter value={10} durationMs={1000} />);
    expect(container.textContent).toBe("0");

    const entry = { isIntersecting: true } as IntersectionObserverEntry;
    act(() => {
      callback?.([entry], {} as IntersectionObserver);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(container.textContent).toBe("10");
  });

  it("använder renderValue för formattering", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(
      <StatCounter value={1000} renderValue={(n) => `${n}+`} />,
    );
    expect(container.textContent).toBe("1000+");
  });
});

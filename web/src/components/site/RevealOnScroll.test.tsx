// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RevealOnScroll } from "./RevealOnScroll";

describe("RevealOnScroll", () => {
  let observed: Element[];
  let callback: IntersectionObserverCallback | null;

  beforeEach(() => {
    observed = [];
    callback = null;

    class MockObserver implements IntersectionObserver {
      readonly root: Element | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];

      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe(target: Element) {
        observed.push(target);
      }
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
  });

  it("renderar barnen direkt", () => {
    const { getByText } = render(<RevealOnScroll>Hej</RevealOnScroll>);
    expect(getByText("Hej")).toBeDefined();
  });

  it("startar med data-revealed='false'", () => {
    const { container } = render(<RevealOnScroll>innehåll</RevealOnScroll>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("data-revealed")).toBe("false");
  });

  it("sätter data-revealed='true' när element blir synligt", () => {
    const { container } = render(<RevealOnScroll>innehåll</RevealOnScroll>);
    const el = container.firstElementChild as HTMLElement;

    const entry = {
      isIntersecting: true,
      target: el,
    } as unknown as IntersectionObserverEntry;

    callback?.([entry], {} as IntersectionObserver);

    expect(el.getAttribute("data-revealed")).toBe("true");
  });

  it("observerar elementet vid mount", () => {
    const { container } = render(<RevealOnScroll>innehåll</RevealOnScroll>);
    const el = container.firstElementChild as HTMLElement;
    expect(observed).toContain(el);
  });
});

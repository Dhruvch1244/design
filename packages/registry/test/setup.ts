import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Without this, portaled content (Radix Dialog/Popover/Drawer, etc.) from
// one test's render() stays attached to document.body and leaks into the
// next test's axe scan -- which is why a11y.test.tsx must run with real
// cleanup between cases, not just React's own unmount.
afterEach(() => {
  cleanup();
});

// jsdom implements neither ResizeObserver nor window.matchMedia. Several of
// the newer registry components depend on them at mount time (cmdk's list
// sizing, embla-carousel-react's responsive breakpoints, react-resizable-
// panels' layout observer) even when nothing in the test actually resizes
// anything -- without these stubs those components throw during effects
// and every a11y test that renders them fails before axe ever runs.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = "";
    thresholds: number[] = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
}

// jsdom's HTMLElement has no layout engine, so scrollIntoView is simply
// absent -- cmdk (used by Command/MultiSelect) calls it to keep the
// highlighted option in view as the list scrolls.
if (typeof HTMLElement !== "undefined" && !HTMLElement.prototype.scrollIntoView) {
  HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
}

if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

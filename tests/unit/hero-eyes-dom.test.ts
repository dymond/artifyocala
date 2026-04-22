// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { bindHeroEyes } from "../../src/lib/hero-eyes-dom";

const stubMatchMedia = (opts: { finePointerHover: boolean }): void => {
  const mq = (query: string) => {
    if (query === "(hover: hover) and (pointer: fine)")
      return {
        matches: opts.finePointerHover,
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
        onchange: null,
      } as MediaQueryList;
    return {
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => true,
      onchange: null,
    } as MediaQueryList;
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation(mq),
  });
};

describe("hero-eyes-dom", () => {
  const origMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: origMatchMedia,
    });
  });

  it("applies inline translate when pointer moves", () => {
    stubMatchMedia({ finePointerHover: true });
    document.body.innerHTML = `
      <div data-artify-hero-eyes>
        <span class="artify-hero-pupil"></span>
        <span class="artify-hero-pupil"></span>
      </div>
    `;
    const root = document.querySelector<HTMLElement>("[data-artify-hero-eyes]");
    expect(root).not.toBeNull();

    // Stable rect so math is deterministic.
    root!.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 100, height: 20 }) as any;

    const teardown = bindHeroEyes(root);
    expect(root!.querySelector<HTMLElement>(".artify-hero-pupil")!.style.transform).toBe("");

    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: 100,
        clientY: 0,
        pointerId: 1,
        pointerType: "mouse",
      }),
    );

    const t = root!.querySelector<HTMLElement>(".artify-hero-pupil")!.style.transform;
    expect(t).toContain("translate3d(");

    teardown();
  });

  it("applies kiss animation class on click (touch / no fine hover)", () => {
    vi.useFakeTimers();
    stubMatchMedia({ finePointerHover: false });
    document.body.innerHTML = `
      <div data-artify-hero-eyes>
        <span class="artify-hero-pupil"></span>
        <span class="artify-hero-pupil"></span>
      </div>
    `;
    const root = document.querySelector<HTMLElement>("[data-artify-hero-eyes]")!;

    const teardown = bindHeroEyes(root);
    expect(root.classList.contains("artify-hero-eyes--hover")).toBe(false);
    root.click();
    expect(root.classList.contains("artify-hero-eyes--hover")).toBe(true);
    vi.advanceTimersByTime(1300);
    expect(root.classList.contains("artify-hero-eyes--hover")).toBe(false);
    teardown();
    vi.useRealTimers();
  });

  it("applies kiss animation class on click with fine pointer + hover", () => {
    vi.useFakeTimers();
    stubMatchMedia({ finePointerHover: true });
    document.body.innerHTML = `
      <div data-artify-hero-eyes>
        <span class="artify-hero-pupil"></span>
        <span class="artify-hero-pupil"></span>
      </div>
    `;
    const root = document.querySelector<HTMLElement>("[data-artify-hero-eyes]")!;

    const teardown = bindHeroEyes(root);
    expect(root.classList.contains("artify-hero-eyes--hover")).toBe(false);
    root.click();
    expect(root.classList.contains("artify-hero-eyes--hover")).toBe(true);
    vi.advanceTimersByTime(1300);
    expect(root.classList.contains("artify-hero-eyes--hover")).toBe(false);
    teardown();
    vi.useRealTimers();
  });
});


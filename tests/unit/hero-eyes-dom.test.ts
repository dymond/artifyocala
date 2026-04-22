// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { bindHeroEyes } from "../../src/lib/hero-eyes-dom";

describe("hero-eyes-dom", () => {
  it("applies inline translate when pointer moves", () => {
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
});


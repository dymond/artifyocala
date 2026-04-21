import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

function css(): string {
  const p = fileURLToPath(new URL("../../src/styles/global.css", import.meta.url));
  return readFileSync(p, "utf8");
}

function keyframesBlock(name: string): string {
  const c = css();
  const marker = `@keyframes ${name} {`;
  const start = c.indexOf(marker);
  expect(start, `Missing ${marker}`).toBeGreaterThanOrEqual(0);

  const next = c.indexOf("\n@keyframes ", start + marker.length);
  const end = next === -1 ? c.length : next;
  return c.slice(start, end);
}

describe("hero collage card tilt angles", () => {
  it("tilts the bottom-left card down left→right", () => {
    // Flip cycle C is used by the bottom-left card.
    const kf = keyframesBlock("artify-hero-flip-cycle-c");
    expect(kf).toContain("rotate(5deg)");
  });

  it("reduces the bottom-right card tilt angle", () => {
    // Flip cycle D is used by the bottom-right card.
    const kf = keyframesBlock("artify-hero-flip-cycle-d");
    expect(kf).toContain("rotate(-6deg)");
  });
});


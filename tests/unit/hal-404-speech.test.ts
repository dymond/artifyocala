import { describe, expect, it } from "vitest";
import {
  HAL_404_MESSAGES,
  HAL_404_SPEECH,
  HAL_404_TIER_LINES,
  muteHal404Speech,
  pickRandomHal404VariantIndex,
} from "../../src/lib/hal-404-speech";

describe("hal-404-speech", () => {
  it("has escalating tiers and mentions home", () => {
    expect(HAL_404_TIER_LINES.length).toBeGreaterThanOrEqual(4);
    expect(HAL_404_MESSAGES.length).toBe(HAL_404_TIER_LINES.length);
    expect(HAL_404_SPEECH.length).toBeGreaterThan(80);
    expect(HAL_404_SPEECH.toLowerCase()).toMatch(/home/);
    expect(HAL_404_SPEECH.toLowerCase()).not.toMatch(/lorem/i);
    const lastTier = HAL_404_TIER_LINES[HAL_404_TIER_LINES.length - 1]!;
    expect(
      lastTier.some((line) =>
        /end of line|leave|stay/.test(line.toLowerCase())
      )
    ).toBe(true);
  });

  it("pickRandomHal404VariantIndex stays within each tier", () => {
    for (let i = 0; i < HAL_404_TIER_LINES.length; i++) {
      const n = HAL_404_TIER_LINES[i]!.length;
      for (let k = 0; k < 30; k++) {
        const v = pickRandomHal404VariantIndex(i);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(n);
      }
    }
  });

  it("exposes mute without throwing in test environment", () => {
    expect(typeof muteHal404Speech).toBe("function");
    expect(() => muteHal404Speech()).not.toThrow();
  });
});

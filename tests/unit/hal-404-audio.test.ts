import { describe, expect, it } from "vitest";
import { hal404TierAudioUrl } from "../../src/lib/hal-404-audio";
import { HAL_404_TIER_LINES } from "../../src/lib/hal-404-speech";

describe("hal-404-audio", () => {
  it("has one asset URL per tier line variant", () => {
    for (let i = 0; i < HAL_404_TIER_LINES.length; i++) {
      const variants = HAL_404_TIER_LINES[i]!;
      for (let j = 0; j < variants.length; j++) {
        expect(hal404TierAudioUrl(i, j)).toBe(
          `/audio/hal-404/tier-${i}-v${j}.mp3`
        );
      }
    }
  });
});

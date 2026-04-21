import { describe, it, expect } from "vitest";
import { heroPlayfulCollageCards } from "../../src/lib/hero-playful-collage-data";

describe("hero collage typography", () => {
  it("scales caption strip font sizes up on wide viewports", () => {
    for (const c of heroPlayfulCollageCards) {
      expect(c.frontStripClass).toContain("lg:text-");
      expect(c.frontStripClass).toContain("xl:text-");
      expect(c.backStripClass).toContain("lg:text-");
      expect(c.backStripClass).toContain("xl:text-");
    }
  });
});


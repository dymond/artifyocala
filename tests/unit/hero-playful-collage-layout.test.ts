import { describe, it, expect } from "vitest";
import { heroPlayfulCollageCards } from "../../src/lib/hero-playful-collage-data";

describe("heroPlayfulCollageCards layout", () => {
  it("includes desktop breakpoint sizing so the collage fills wide screens", () => {
    for (const c of heroPlayfulCollageCards) {
      expect(c.box).toContain("lg:");
      expect(c.box).toContain("xl:");
    }
  });
});


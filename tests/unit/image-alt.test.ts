import { describe, expect, it } from "vitest";
import { imageAlt } from "../../src/lib/image-alt";

describe("imageAlt", () => {
  it("uses primary when non-empty", () => {
    expect(imageAlt("Hello", "fallback")).toBe("Hello");
    expect(imageAlt("  x  ", "fallback")).toBe("x");
  });

  it("uses fallback when primary empty", () => {
    expect(imageAlt("", "fallback")).toBe("fallback");
    expect(imageAlt("   ", "fallback")).toBe("fallback");
    expect(imageAlt(undefined, "fallback")).toBe("fallback");
  });

  it("returns empty for decorative", () => {
    expect(imageAlt("ignored", "f", { decorative: true })).toBe("");
  });
});

import { describe, expect, it } from "vitest";
import {
  GALLERY_MARQUEE_DEFAULT_DURATION_SEC,
  GALLERY_MARQUEE_PIXELS_PER_SECOND,
  galleryMarqueeDurationSecondsForSegmentWidth,
} from "../../src/lib/gallery-marquee-speed-constants";

describe("galleryMarqueeDurationSecondsForSegmentWidth", () => {
  it("turns width into time at constant px/s (one loop = one segment width)", () => {
    const sec = galleryMarqueeDurationSecondsForSegmentWidth(2304, 32);
    expect(sec).toBe(72);
  });

  it("makes a strip twice as wide take twice as long (same linear speed)", () => {
    const a = galleryMarqueeDurationSecondsForSegmentWidth(1000, 25);
    const b = galleryMarqueeDurationSecondsForSegmentWidth(2000, 25);
    expect(b).toBe(2 * a);
  });

  it("returns 0 for non-positive or non-finite input", () => {
    expect(galleryMarqueeDurationSecondsForSegmentWidth(0)).toBe(0);
    expect(galleryMarqueeDurationSecondsForSegmentWidth(-10)).toBe(0);
    expect(galleryMarqueeDurationSecondsForSegmentWidth(100, 0)).toBe(0);
  });
});

describe("default constants", () => {
  it("exposes 32 px/s and 72s fallback", () => {
    expect(GALLERY_MARQUEE_PIXELS_PER_SECOND).toBe(32);
    expect(GALLERY_MARQUEE_DEFAULT_DURATION_SEC).toBe(72);
  });
});

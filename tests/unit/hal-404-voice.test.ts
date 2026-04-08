import { describe, expect, it } from "vitest";
import {
  proximityFromNdc,
  proximityFromScreenPoint,
  proximityFromScreenPointOrbHost,
  shouldAutoStartOrbSpeech,
  shouldHoldSpeechProximity,
  splitSpeechChunks,
  volumeFromProximity,
} from "../../src/lib/hal-404-voice";

describe("hal-404-voice", () => {
  it("splits text on sentence boundaries", () => {
    const c = splitSpeechChunks("First. Second! Third?");
    expect(c).toEqual(["First.", "Second!", "Third?"]);
  });

  it("proximity is high near canvas center (NDC)", () => {
    expect(proximityFromNdc(0, 0)).toBeCloseTo(1, 1);
    expect(proximityFromNdc(0.9, 0)).toBeLessThan(0.35);
  });

  it("screen proximity increases before the pointer reaches the element", () => {
    const rect = { left: 400, top: 300, width: 200, height: 200 };
    const cx = 500;
    const cy = 400;
    const atCenter = proximityFromScreenPoint(cx, cy, rect);
    const outsideButNear = proximityFromScreenPoint(cx + 130, cy + 85, rect);
    const far = proximityFromScreenPoint(cx + 900, cy + 700, rect);
    expect(atCenter).toBeGreaterThan(0.98);
    expect(outsideButNear).toBeGreaterThan(far);
    expect(outsideButNear).toBeGreaterThan(0.08);
  });

  it("maps proximity to audible volume range", () => {
    expect(volumeFromProximity(0)).toBeGreaterThan(0);
    expect(volumeFromProximity(1)).toBeLessThanOrEqual(1);
    expect(volumeFromProximity(1)).toBeGreaterThan(volumeFromProximity(0.3));
  });

  it("uses combined proximity thresholds for hold and auto-start", () => {
    expect(shouldHoldSpeechProximity(0)).toBe(false);
    expect(shouldHoldSpeechProximity(0.055)).toBe(true);
    expect(shouldAutoStartOrbSpeech(0.2)).toBe(true);
    expect(shouldAutoStartOrbSpeech(0.08)).toBe(false);
  });

  it("orb host proximity is tight to center (not whole viewport)", () => {
    const rect = { left: 0, top: 0, width: 400, height: 400 };
    const cx = 200;
    const cy = 200;
    const rOrb = 400 * 0.32;
    expect(proximityFromScreenPointOrbHost(cx, cy, rect)).toBeCloseTo(1, 5);
    expect(proximityFromScreenPointOrbHost(cx + rOrb, cy, rect)).toBeCloseTo(0, 5);
    expect(proximityFromScreenPointOrbHost(cx + rOrb * 0.5, cy, rect)).toBeCloseTo(0.5, 5);
    const farInBox = proximityFromScreenPointOrbHost(395, 395, rect);
    const nearCenter = proximityFromScreenPointOrbHost(210, 205, rect);
    expect(nearCenter).toBeGreaterThan(0.85);
    expect(farInBox).toBeLessThan(0.05);
  });
});

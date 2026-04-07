import { describe, expect, it } from "vitest";
import {
  clientToNdc,
  computePointerAggression,
} from "../../src/lib/hal-404-pointer";

describe("hal-404-pointer", () => {
  it("maps client coords to NDC with center at origin", () => {
    const rect = { left: 100, top: 200, width: 400, height: 200 };
    expect(clientToNdc(100, 200, rect)).toEqual({ x: -1, y: 1 });
    const c = clientToNdc(300, 300, rect);
    expect(c.x).toBeCloseTo(0, 5);
    expect(c.y).toBeCloseTo(0, 5);
    expect(clientToNdc(500, 200, rect)).toEqual({ x: 1, y: 1 });
  });

  it("returns higher aggression when cursor is near center", () => {
    const near = computePointerAggression({
      ndcX: 0.05,
      ndcY: -0.05,
      prevNdcX: 0.05,
      prevNdcY: -0.05,
      prevDist: 0.08,
      dt: 1 / 60,
    });
    const far = computePointerAggression({
      ndcX: 0.92,
      ndcY: -0.88,
      prevNdcX: 0.92,
      prevNdcY: -0.88,
      prevDist: 1.2,
      dt: 1 / 60,
    });
    expect(near.aggression).toBeGreaterThan(far.aggression);
  });

  it("spikes aggression on fast tangential motion", () => {
    const still = computePointerAggression({
      ndcX: 0.2,
      ndcY: 0,
      prevNdcX: 0.2,
      prevNdcY: 0,
      prevDist: 0.2,
      dt: 1 / 60,
    });
    const whip = computePointerAggression({
      ndcX: 0.95,
      ndcY: 0,
      prevNdcX: -0.95,
      prevNdcY: 0,
      prevDist: 0.95,
      dt: 1 / 60,
    });
    expect(whip.aggression).toBeGreaterThan(still.aggression);
  });

  it("spikes aggression when moving inward toward center", () => {
    const outward = computePointerAggression({
      ndcX: 0.5,
      ndcY: 0,
      prevNdcX: 0.45,
      prevNdcY: 0,
      prevDist: 0.45,
      dt: 1 / 60,
    });
    const inward = computePointerAggression({
      ndcX: 0.35,
      ndcY: 0,
      prevNdcX: 0.45,
      prevNdcY: 0,
      prevDist: 0.45,
      dt: 1 / 60,
    });
    expect(inward.aggression).toBeGreaterThan(outward.aggression);
  });
});

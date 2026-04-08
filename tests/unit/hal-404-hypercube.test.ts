import { describe, expect, it } from "vitest";

import { hal404ImpliedHypercubeData } from "../../src/scripts/hal-404-blob";

describe("hal404ImpliedHypercubeData", () => {
  it("returns 16 points (outer + inner cube)", () => {
    const { points } = hal404ImpliedHypercubeData(2);
    expect(points.length).toBe(16 * 3);
  });

  it("returns streak segments as pairs of vertices", () => {
    const { streaks } = hal404ImpliedHypercubeData(1.5);
    expect(streaks.length % (2 * 3)).toBe(0);
    // Should be non-trivial: outer edges (12) *2 + outer-inner (8)*2 = 40 segments => 40*2 verts => 80 verts => 240 floats
    expect(streaks.length).toBe(240);
  });

  it("returns 32 full edges for flowing particles (outer + inner + connectors)", () => {
    const { flowEdges } = hal404ImpliedHypercubeData(1);
    expect(flowEdges.length).toBe(32 * 6);
  });
});


import { describe, it, expect } from "vitest";
import { pickKissDelayMs } from "../../src/lib/hero-kiss";

describe("hero-kiss", () => {
  it("picks a delay within the configured range (inclusive)", () => {
    const rngMin = () => 0;
    const rngMax = () => 1;

    expect(pickKissDelayMs({ rng: rngMin, minMs: 10_000, maxMs: 20_000 })).toBe(
      10_000,
    );
    expect(pickKissDelayMs({ rng: rngMax, minMs: 10_000, maxMs: 20_000 })).toBe(
      20_000,
    );
  });

  it("rounds to a whole millisecond so timers are stable", () => {
    const rng = () => 0.1234567;
    const d = pickKissDelayMs({ rng, minMs: 1, maxMs: 2 });
    expect(Number.isInteger(d)).toBe(true);
  });
});


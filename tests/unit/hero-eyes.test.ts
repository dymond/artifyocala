import { describe, it, expect } from 'vitest';
import { offsetTowardPointClamped, HERO_EYE_MAX_OFFSET } from '../../src/lib/hero-eyes';

describe('hero-eyes', () => {
  it('returns zero when pointer is at strip center', () => {
    const rect = { left: 100, top: 200, width: 40, height: 16 };
    const o = offsetTowardPointClamped(120, 208, rect, HERO_EYE_MAX_OFFSET);
    expect(o.x).toBe(0);
    expect(o.y).toBe(0);
  });

  it('clamps offset to max distance from center', () => {
    const rect = { left: 0, top: 0, width: 100, height: 20 };
    const o = offsetTowardPointClamped(10_000, 0, rect, 5);
    expect(Math.hypot(o.x, o.y)).toBeLessThanOrEqual(5 + 1e-6);
    expect(o.x).toBeGreaterThan(0);
  });
});

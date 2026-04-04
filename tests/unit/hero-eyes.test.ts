import { describe, it, expect } from 'vitest';
import {
  offsetTowardPointClamped,
  HERO_EYE_CLAMP,
  HERO_EYE_MAX_OFFSET_X,
  HERO_EYE_MAX_OFFSET_Y_UP,
} from '../../src/lib/hero-eyes';

function ellipseNorm(o: { x: number; y: number }): number {
  const maxY = o.y <= 0 ? HERO_EYE_CLAMP.maxYUp : HERO_EYE_CLAMP.maxYDown;
  const nx = o.x / HERO_EYE_MAX_OFFSET_X;
  const ny = o.y / maxY;
  return nx * nx + ny * ny;
}

describe('hero-eyes', () => {
  it('returns zero when pointer is at strip center', () => {
    const rect = { left: 100, top: 200, width: 40, height: 16 };
    const o = offsetTowardPointClamped(120, 208, rect, HERO_EYE_CLAMP);
    expect(o.x).toBe(0);
    expect(o.y).toBe(0);
  });

  it('clamps horizontal offset when pointer is far to the side', () => {
    const rect = { left: 0, top: 0, width: 100, height: 20 };
    const o = offsetTowardPointClamped(10_000, 10, rect, HERO_EYE_CLAMP);
    expect(o.x).toBeLessThanOrEqual(HERO_EYE_MAX_OFFSET_X + 1e-6);
    expect(o.x).toBeGreaterThan(0);
    expect(ellipseNorm(o)).toBeLessThanOrEqual(1 + 1e-9);
  });

  it('limits upward travel more than horizontal so pupils stay below upper lid', () => {
    const rect = { left: 0, top: 0, width: 100, height: 20 };
    const o = offsetTowardPointClamped(50, -1_000_000, rect, HERO_EYE_CLAMP);
    expect(o.y).toBeGreaterThanOrEqual(-HERO_EYE_MAX_OFFSET_Y_UP - 1e-6);
    expect(o.y).toBeLessThanOrEqual(0);
    expect(ellipseNorm(o)).toBeLessThanOrEqual(1 + 1e-9);
  });
});

import { describe, it, expect, afterEach } from 'vitest';
import {
  computeWhoArchBackdropLayout,
  mountWhoArchBackdrop,
  unmountWhoArchBackdrop,
} from '../../src/scripts/who-arch-backdrop';

describe('who-arch-backdrop', () => {
  afterEach(() => {
    unmountWhoArchBackdrop();
  });

  it('sizes the mesh plane to match the orthographic frustum so the stage fills the canvas', () => {
    const amp = 320;
    const L = computeWhoArchBackdropLayout(800, 600, amp);
    expect(L.orthoRight - L.orthoLeft).toBe(L.planeW);
    expect(L.orthoTop - L.orthoBottom).toBe(L.planeH);
    expect(L.planeW).toBeGreaterThan(L.w);
    expect(L.planeH).toBeGreaterThan(L.h);
    expect(L.overscanWorld).toBeGreaterThan(0);
    expect(L.bottomRelief).toBeGreaterThan(0);
  });

  it('adds no overscan when overscanPx is 0', () => {
    const L = computeWhoArchBackdropLayout(800, 600, 320, { overscanPx: 0 });
    expect(L.overscanWorld).toBe(0);
    expect(L.orthoRight - L.orthoLeft).toBe(L.planeW);
  });

  it('does not throw when canvas is absent', () => {
    expect(() => {
      mountWhoArchBackdrop();
    }).not.toThrow();
  });
});

import { describe, it, expect } from 'vitest';
import {
  MESSY_PALETTE_CSS_VARS,
  paletteIndexFromPointer,
} from '../../src/lib/site-messy-palette';

describe('site-messy-palette', () => {
  it('exports a non-empty ordered palette of CSS variable names', () => {
    expect(MESSY_PALETTE_CSS_VARS.length).toBeGreaterThanOrEqual(3);
    for (const v of MESSY_PALETTE_CSS_VARS) {
      expect(v).toMatch(/^--color-/);
    }
  });

  it('paletteIndexFromPointer returns a valid index', () => {
    const len = MESSY_PALETTE_CSS_VARS.length;
    for (const [x, y] of [
      [0, 0],
      [120.5, 88.2],
      [-40, 900],
    ] as const) {
      const i = paletteIndexFromPointer(x, y, len);
      expect(i).toBeGreaterThanOrEqual(0);
      expect(i).toBeLessThan(len);
    }
  });

  it('paletteIndexFromPointer is stable for the same inputs', () => {
    const len = MESSY_PALETTE_CSS_VARS.length;
    expect(paletteIndexFromPointer(33, 44, len)).toBe(paletteIndexFromPointer(33, 44, len));
  });
});

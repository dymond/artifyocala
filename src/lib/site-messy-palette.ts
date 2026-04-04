/** Brand colors for studio splatter / brush (resolved via getComputedStyle on :root). */
export const MESSY_PALETTE_CSS_VARS = [
  '--color-accent-soft',
  '--color-buzz',
  '--color-club',
  '--color-surge',
  '--color-accent',
] as const;

/**
 * Deterministic palette slot from pointer position so nearby strokes vary but repeat predictably in tests.
 */
export function paletteIndexFromPointer(x: number, y: number, len: number): number {
  if (len <= 0) return 0;
  const s = Math.abs(Math.sin(x * 0.017 + y * 0.023));
  return Math.min(len - 1, Math.floor(s * len));
}

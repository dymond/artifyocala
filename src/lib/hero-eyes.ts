/** Max distance (px) pupils can move from center of the eye strip. */
export const HERO_EYE_MAX_OFFSET = 5;

/**
 * Offset from the center of `rect` toward (px, py), clamped to a circular radius of `max`.
 */
export function offsetTowardPointClamped(
  px: number,
  py: number,
  rect: { left: number; top: number; width: number; height: number },
  max: number,
): { x: number; y: number } {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let x = px - cx;
  let y = py - cy;
  const m = Math.hypot(x, y);
  if (m > max && m > 0) {
    x = (x / m) * max;
    y = (y / m) * max;
  }
  return { x, y };
}

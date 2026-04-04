/** Horizontal pupil travel (px) — strip is wide. */
export const HERO_EYE_MAX_OFFSET_X = 8;

/**
 * Upward pupil travel (px, negative in math / negative translate) — tight so pupils
 * stay visible below the upper eyelid when the cursor is above the eyes.
 */
export const HERO_EYE_MAX_OFFSET_Y_UP = 1.15;

/** Downward pupil travel (px) — more room above the lower lid. */
export const HERO_EYE_MAX_OFFSET_Y_DOWN = 7.5;

/** Extra translateY (px) so pupils sit slightly low in the socket under the upper lid. */
export const HERO_EYE_PUPIL_Y_BIAS_PX = 1.75;

export type HeroEyeClamp = {
  maxX: number;
  maxYUp: number;
  maxYDown: number;
};

/** Defaults used by the hero collage eyes. */
export const HERO_EYE_CLAMP: HeroEyeClamp = {
  maxX: HERO_EYE_MAX_OFFSET_X,
  maxYUp: HERO_EYE_MAX_OFFSET_Y_UP,
  maxYDown: HERO_EYE_MAX_OFFSET_Y_DOWN,
};

/**
 * Offset from the center of `rect` toward (px, py), clamped to an axis-aligned
 * ellipse: horizontal radius `maxX`, vertical radius `maxYUp` for y ≤ 0 and
 * `maxYDown` for y > 0 (so looking “up” at the cursor moves the pupil less).
 */
export function offsetTowardPointClamped(
  px: number,
  py: number,
  rect: { left: number; top: number; width: number; height: number },
  clamp: HeroEyeClamp,
): { x: number; y: number } {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  let x = px - cx;
  let y = py - cy;

  const maxY = y <= 0 ? clamp.maxYUp : clamp.maxYDown;
  if (clamp.maxX <= 0 || maxY <= 0) return { x: 0, y: 0 };

  const nx = x / clamp.maxX;
  const ny = y / maxY;
  const len = Math.hypot(nx, ny);
  if (len > 1 && len > 0) {
    x = (nx / len) * clamp.maxX;
    y = (ny / len) * maxY;
  }
  return { x, y };
}

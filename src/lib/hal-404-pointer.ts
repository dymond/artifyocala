/**
 * Screen-space math for HAL 404 blob pointer “aggression” (testable, no DOM).
 */

export type AggressionSample = {
  ndcX: number;
  ndcY: number;
  prevNdcX: number;
  prevNdcY: number;
  prevDist: number;
  dt: number;
};

export type AggressionResult = {
  /** 0 = calm, 1 = max threat */
  aggression: number;
  /** Current cursor distance from canvas center in NDC space */
  dist: number;
};

/**
 * Convert pointer coordinates to normalized device coords relative to a rect:
 * center = (0,0), left = -1, right = 1, bottom = -1, top = 1 (Y up).
 */
export function clientToNdc(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number }
): { x: number; y: number } {
  const w = Math.max(rect.width, 1e-6);
  const h = Math.max(rect.height, 1e-6);
  const x = ((clientX - rect.left) / w) * 2 - 1;
  const y = -(((clientY - rect.top) / h) * 2 - 1);
  return { x, y };
}

/**
 * Combine proximity, tangential speed, and inward radial motion toward center.
 */
export function computePointerAggression(sample: AggressionSample): AggressionResult {
  const dt = Math.max(sample.dt, 1 / 1000);
  const dist = Math.hypot(sample.ndcX, sample.ndcY);
  const proximity = Math.max(0, 1 - dist / 1.22);

  const dx = sample.ndcX - sample.prevNdcX;
  const dy = sample.ndcY - sample.prevNdcY;
  const tangentialSpeed = Math.hypot(dx, dy) / dt;
  const speedNorm = Math.min(1, tangentialSpeed / 9);

  const radialIn = Math.max(0, sample.prevDist - dist) / dt;
  const inwardNorm = Math.min(1, radialIn / 5.5);

  const aggression = Math.min(
    1,
    proximity * 0.38 + speedNorm * 0.37 + inwardNorm * 0.38
  );

  return { aggression, dist };
}

/** Split HAL narration into chunks so volume can update between sentences. */
export function splitSpeechChunks(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [text];
}

/** 0 = far from canvas center, 1 = at center (NDC). */
export function proximityFromNdc(ndcX: number, ndcY: number): number {
  const d = Math.hypot(ndcX, ndcY);
  return Math.max(0, Math.min(1, 1 - d / 1.18));
}

/**
 * Screen-space proximity to the orb: 1 at center of `rect`, 0 at falloff radius.
 * Falloff extends beyond the element so moving the cursor *toward* the orb ramps up
 * before the pointer enters the canvas.
 */
export function proximityFromScreenPoint(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number }
): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const d = Math.hypot(clientX - cx, clientY - cy);
  const halfMax = Math.max(rect.width, rect.height) / 2;
  const falloffRadius = halfMax + Math.min(220, halfMax * 0.75);
  if (falloffRadius < 1e-6) return 0;
  return Math.max(0, Math.min(1, 1 - d / falloffRadius));
}

/**
 * Tight falloff for the 404 WebGL orb: uses the layout host rect but maps proximity to a
 * small disc (~visible sphere), not the full box. Avoids the old “+220px” halo that kept
 * speech engaged until the pointer was near the viewport edge.
 */
export function proximityFromScreenPointOrbHost(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number }
): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const d = Math.hypot(clientX - cx, clientY - cy);
  const minSide = Math.min(rect.width, rect.height);
  /** Distance from center at which proximity reaches 0 (tuned to ~on-sphere, not whole host). */
  const falloffRadius = minSide * 0.24;
  if (falloffRadius < 1e-6) return 0;
  return Math.max(0, Math.min(1, 1 - d / falloffRadius));
}

/** Map proximity to utterance volume (never fully silent while “in range”). */
export function volumeFromProximity(proximity: number): number {
  const p = Math.max(0, Math.min(1, proximity));
  return 0.08 + 0.92 * Math.pow(p, 1.12);
}

/** Keep speaking while combined proximity (pointer approach or scroll-in-view) is in range. */
export function shouldHoldSpeechProximity(proximity: number): boolean {
  return proximity >= 0.065;
}

/** Begin / continue hover-driven speech when close enough in screen space or orb is well in view. */
export function shouldAutoStartOrbSpeech(proximity: number): boolean {
  return proximity >= 0.13;
}

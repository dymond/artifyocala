/**
 * Gallery marquee: animation moves the track by 50% (one unduplicated image strip)
 * per loop. A fixed time for the full loop made wider strips (more images) look
 * faster. We instead hold linear speed: duration = segmentWidth / this value.
 * (72s × 32 ≈ 2304px reference segment, slightly quicker than the previous default.)
 */
export const GALLERY_MARQUEE_PIXELS_PER_SECOND = 32;

/** When JS has not set per-track --gallery-marquee-duration yet. */
export const GALLERY_MARQUEE_DEFAULT_DURATION_SEC = 72;

export function galleryMarqueeDurationSecondsForSegmentWidth(
  segmentWidthPx: number,
  pixelsPerSecond: number = GALLERY_MARQUEE_PIXELS_PER_SECOND,
): number {
  if (segmentWidthPx <= 0 || !Number.isFinite(segmentWidthPx)) return 0;
  if (pixelsPerSecond <= 0 || !Number.isFinite(pixelsPerSecond)) return 0;
  return segmentWidthPx / pixelsPerSecond;
}

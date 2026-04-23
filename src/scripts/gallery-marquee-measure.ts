/**
 * One “segment” is the first duplicated half of the marquee track
 * (the flex row of `figure`s before the `aria-hidden` copy).
 */
export function measureMarqueeTrackSegmentWidth(
  trackEl: HTMLElement | null,
): number {
  if (!trackEl) return 0;
  const first = trackEl.querySelector(":scope > div.pointer-events-none");
  return (first as HTMLElement | null)?.scrollWidth ?? 0;
}

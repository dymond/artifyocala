export type PickKissDelayMsOptions = {
  minMs: number;
  maxMs: number;
  rng?: () => number;
};

export function pickKissDelayMs({
  minMs,
  maxMs,
  rng = Math.random,
}: PickKissDelayMsOptions): number {
  const lo = Math.min(minMs, maxMs);
  const hi = Math.max(minMs, maxMs);
  const t = rng();
  const clamped = Math.min(1, Math.max(0, t));
  return Math.round(lo + (hi - lo) * clamped);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? true;
}


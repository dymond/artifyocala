import { stopHal404AudioPlayback } from "./hal-404-audio";
import tierData from "./hal-404-speech-tiers.json";

/** Per tier: multiple lines; one variant is chosen at random when a tier plays. Cordial → openly threatening. */
export const HAL_404_TIER_LINES = tierData as readonly (readonly string[])[];

/** First line of each tier (compact / legacy consumers). */
export const HAL_404_MESSAGES = HAL_404_TIER_LINES.map((t) => t[0]!) as unknown as readonly string[];

export function getHal404VariantCount(tierIndex: number): number {
  return HAL_404_TIER_LINES[tierIndex]?.length ?? 0;
}

/** Uniform random variant index for `tierIndex`. */
export function pickRandomHal404VariantIndex(tierIndex: number): number {
  const n = getHal404VariantCount(tierIndex);
  if (n <= 0) return 0;
  return Math.floor(Math.random() * n);
}

/** Full text for search, legacy checks, and single-string transcript fallback. */
export const HAL_404_SPEECH = HAL_404_TIER_LINES.flat().join(" ");

/** Multi-paragraph transcript: all variants per tier, for reduced-motion / screen readers. */
export const HAL_404_TRANSCRIPT = HAL_404_TIER_LINES.map((lines) =>
  lines.join("\n")
).join("\n\n");

/** Stops pre-recorded 404 narration (HTML5 Audio). */
export function muteHal404Speech(): void {
  if (typeof window === "undefined") return;
  stopHal404AudioPlayback();
}

/**
 * WebGL + layout for the who/arch scroll section — `who-arch-backdrop.ts` imports
 * for uniforms; `WhoScrollArchVisual` uses `base` for CSS behind the canvas.
 *
 * Dark mode: Lighter steps on the same hue as `--color-surge` (#6b64c9), with chroma
 * held below a straight "full saturation" ramp so it never feels neon — top layer
 * should still read clearly as on-brand purple (closer to surge than a twilight muliply).
 */
export const COLORS_DARK = {
  base: "#5c5a72",
  layer1: "#6b64c9",
  layer2: "#5c5a72",
  layer3: "#8c92e3",
} as const;
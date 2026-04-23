/**
 * “What we do” / programs cards: border uses the same token as the hard shadow
 * (no rgba opacity mismatch). Theme keys match `hpiCardTheme` in Tina.
 */
export type ProgramCardTheme = "buzz" | "club" | "surge" | "surgeInk";

export const programCardThemeFraming: Record<
  ProgramCardTheme,
  { border: string; shadow: string }
> = {
  buzz: {
    border: "border-2 border-[color:var(--color-buzz)]",
    shadow: "shadow-[8px_8px_0_0_var(--color-buzz)]",
  },
  club: {
    border: "border-2 border-[color:var(--color-club)]",
    shadow: "shadow-[8px_8px_0_0_var(--color-club)]",
  },
  surge: {
    border: "border-2 border-[color:var(--color-surge)]",
    shadow: "shadow-[8px_8px_0_0_var(--color-surge)]",
  },
  /** Dark purple edge, matches primary/outline button frame on dark surfaces */
  surgeInk: {
    border: "border-2 border-[color:var(--color-surge-ink)]",
    shadow: "shadow-[8px_8px_0_0_var(--color-surge-ink)]",
  },
};

/** CSS color tokens for `program-cards-tilt` inline `box-shadow` (sync with framing). */
export const programCardThemeShadowColor: Record<ProgramCardTheme, string> = {
  buzz: "var(--color-buzz)",
  club: "var(--color-club)",
  surge: "var(--color-surge)",
  surgeInk: "var(--color-surge-ink)",
};

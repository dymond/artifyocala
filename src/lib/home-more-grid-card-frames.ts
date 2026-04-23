/**
 * "Around town" / home more grid: border color matches the hard-shadow color per column.
 * First column uses `surge-ink` (button outline purple) instead of matching ink.
 */
export const homeMoreGridCardFrames = [
  {
    border: "border-2 border-[color:var(--color-surge-ink)]",
    shadow: "shadow-[6px_6px_0_0_var(--color-surge-ink)]",
  },
  {
    border: "border-2 border-[color:var(--color-club)]",
    shadow: "shadow-[6px_6px_0_0_var(--color-club)]",
  },
  {
    border: "border-2 border-[color:var(--color-surge)]",
    shadow: "shadow-[6px_6px_0_0_var(--color-surge)]",
  },
] as const;

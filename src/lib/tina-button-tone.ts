import { btnGhost, btnOutline, btnPrimary, btnSurge } from "./tina-ui-buttons";

/** Matches `Button.astro` and Tina `*Tone` string fields. */
export function btnClassForTone(tone: string | null | undefined): string {
  switch (tone) {
    case "outline":
      return btnOutline;
    case "surge":
      return btnSurge;
    case "ghost":
      return btnGhost;
    case "primary":
    default:
      return btnPrimary;
  }
}

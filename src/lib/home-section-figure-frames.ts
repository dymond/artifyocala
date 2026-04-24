/**
 * Framed home-page photos: dark `border-ink` + solid hard shadow (no rgba vs border mismatch).
 * Matches the Maker meetups “split” photos — reuse for other sections.
 */
export const homeFigureFrameInkBorderBuzzShadow =
  "m-0 min-w-0 rounded-xl overflow-hidden border-[3px] border-ink shadow-[6px_6px_0_0_var(--color-buzz)]";

export const homeFigureFrameInkBorderSurgeShadow =
  "m-0 min-w-0 rounded-xl overflow-hidden border-[3px] border-ink shadow-[6px_6px_0_0_var(--color-surge)]";

export const homeFigureImageClip = "";

/**
 * Whole-frame tilt for Brick City Glam CTA photo — must live on the `figure`, not the `img`
 * (otherwise the image looks “broken out of” the border).
 */
export const homeCtaBandFigureTilt = "rotate-[0.4deg]";

/**
 * Home hero “hiring poster” image: subtle tilt; border + shadow move with the image.
 */
export const homeHeroHiringPosterFigure =
  "m-0 w-full min-w-0 max-lg:order-4 -rotate-[0.5deg] rounded-xl overflow-hidden border-[3px] border-ink shadow-[6px_6px_0_0_var(--color-surge)] transition-transform duration-300 hover:rotate-0 lg:min-w-0";

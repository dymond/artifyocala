/**
 * Events gallery: border + hard shadow use the same token in dark mode
 * (matches outline/CTA `surge-ink` — no rgba / semi-transparent border mismatch).
 */
const EVENT_GALLERY_TILE_FRAME_CORE =
  "overflow-hidden rounded-2xl border-[3px] border-ink bg-white shadow-[10px_10px_0_0_var(--color-ink)] transition-transform duration-300 hover:-translate-y-1 dark:border-[color:var(--color-surge-ink)] dark:bg-panel/90 dark:shadow-[10px_10px_0_0_var(--color-surge-ink)]";

/** Static Astro: tile is `<a>` or `<div>`. */
export const eventGalleryTileFrameAstro = `group block cursor-pointer ${EVENT_GALLERY_TILE_FRAME_CORE}`;

/** Tina preview: tile is `<a>` or `<button>`. */
export const eventGalleryTileFrameReact = `group relative block ${EVENT_GALLERY_TILE_FRAME_CORE}`;

export const eventGalleryLightboxImageClass =
  "absolute rounded-xl border-[3px] border-ink bg-white shadow-[10px_10px_0_0_var(--color-ink)] dark:border-[color:var(--color-surge-ink)] dark:bg-panel/90 dark:shadow-[10px_10px_0_0_var(--color-surge-ink)]";

export const eventGalleryLightboxCloseClass =
  "pointer-events-auto fixed inline-flex cursor-pointer items-center gap-2 rounded-full border-[3px] border-ink bg-white px-4 py-2 font-display text-sm text-ink shadow-[6px_6px_0_0_var(--color-ink)] transition-all duration-150 hover:-translate-y-[1px] hover:bg-accent-soft hover:text-ink hover:shadow-[8px_8px_0_0_var(--color-ink)] active:translate-y-0 active:shadow-[4px_4px_0_0_var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-soft/50 dark:border-[color:var(--color-surge-ink)] dark:bg-panel/95 dark:text-buzz/95 dark:shadow-[6px_6px_0_0_var(--color-surge-ink)] dark:hover:shadow-[8px_8px_0_0_var(--color-surge-ink)] dark:active:shadow-[4px_4px_0_0_var(--color-surge-ink)] dark:hover:bg-panel dark:hover:text-buzz";

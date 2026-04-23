import {
  GALLERY_MARQUEE_PIXELS_PER_SECOND,
  galleryMarqueeDurationSecondsForSegmentWidth,
} from "../lib/gallery-marquee-speed-constants";
import { measureMarqueeTrackSegmentWidth } from "./gallery-marquee-measure";

function trackIsMeasurable(track: HTMLElement): boolean {
  if (getComputedStyle(track).display === "none") return false;
  return track.getBoundingClientRect().width > 0;
}

function applySpeedToTrack(track: HTMLElement) {
  if (!trackIsMeasurable(track)) return;
  const w = measureMarqueeTrackSegmentWidth(track);
  if (w <= 0) return;
  const sec = galleryMarqueeDurationSecondsForSegmentWidth(
    w,
    GALLERY_MARQUEE_PIXELS_PER_SECOND,
  );
  if (sec <= 0) return;
  const bounded = Math.max(8, sec);
  track.style.setProperty(
    "--gallery-marquee-duration",
    `${Number(bounded.toFixed(3))}s`,
  );
}

/** Sets `--gallery-marquee-duration` on each forward/reverse track from measured width. */
export function syncGalleryMarqueeSpeedsInShell(shell: HTMLElement) {
  const tracks = shell.querySelectorAll<HTMLElement>(
    ".artify-marquee-track--gallery, .artify-marquee-track--gallery-reverse",
  );
  tracks.forEach(applySpeedToTrack);
}

let speedResizeObserver: ResizeObserver | null = null;
const speedImgCleanups: Array<() => void> = [];

/**
 * Wires ResizeObserver + image load to all `[data-gallery-marquee-shell]` in the document
 * (e.g. `GalleryMarquee.astro` client script). For React, prefer `useLayoutEffect` + `ref`.
 */
export function mountGalleryMarqueeShellSpeedForDocument(): () => void {
  destroyGalleryMarqueeShellSpeedForDocument();

  const syncAll = () => {
    requestAnimationFrame(() => {
      document
        .querySelectorAll<HTMLElement>("[data-gallery-marquee-shell]")
        .forEach((shell) => syncGalleryMarqueeSpeedsInShell(shell));
    });
  };

  const shells = [
    ...document.querySelectorAll<HTMLElement>("[data-gallery-marquee-shell]"),
  ];
  if (shells.length === 0) return () => {};

  speedResizeObserver = new ResizeObserver(() => {
    syncAll();
  });
  for (const shell of shells) {
    speedResizeObserver.observe(shell);
    shell.querySelectorAll("img").forEach((img) => {
      if (!img.complete) {
        const onLoad = () => syncAll();
        img.addEventListener("load", onLoad, { once: true });
        speedImgCleanups.push(() => img.removeEventListener("load", onLoad));
      }
    });
  }

  requestAnimationFrame(() => {
    shells.forEach((s) => syncGalleryMarqueeSpeedsInShell(s));
  });

  return () => {
    destroyGalleryMarqueeShellSpeedForDocument();
  };
}

export function destroyGalleryMarqueeShellSpeedForDocument() {
  for (const c of speedImgCleanups) c();
  speedImgCleanups.length = 0;
  speedResizeObserver?.disconnect();
  speedResizeObserver = null;
}

export {
  GALLERY_MARQUEE_DEFAULT_DURATION_SEC,
  GALLERY_MARQUEE_PIXELS_PER_SECOND,
} from "../lib/gallery-marquee-speed-constants";

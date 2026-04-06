/**
 * Desktop (lg+): use two opposite-direction tracks only when each row’s image strip
 * is wide enough to fill the gallery shell; otherwise keep one track with all images.
 */

const LG = "(min-width: 1024px)";

const mediaMq = typeof window !== "undefined" ? window.matchMedia(LG) : null;

export function measureMarqueeTrackSegmentWidth(
  trackEl: HTMLElement | null,
): number {
  if (!trackEl) return 0;
  const first = trackEl.querySelector(":scope > div.pointer-events-none");
  return (first as HTMLElement | null)?.scrollWidth ?? 0;
}

export function segmentFillsContainer(
  segmentWidth: number,
  containerWidth: number,
  epsilonPx = 2,
): boolean {
  if (containerWidth <= 0) return false;
  return segmentWidth >= containerWidth - epsilonPx;
}

export function shouldUseDualDesktopRows(
  widthRowA: number,
  widthRowB: number,
  shellWidth: number,
): boolean {
  return (
    segmentFillsContainer(widthRowA, shellWidth) &&
    segmentFillsContainer(widthRowB, shellWidth)
  );
}

function updateShell(shell: HTMLElement): void {
  const root = shell.querySelector<HTMLElement>(
    "[data-gallery-marquee-desktop-root]",
  );
  if (!root) return;

  const single = root.querySelector<HTMLElement>(".gallery-marquee-dsk-single");
  const dual = root.querySelector<HTMLElement>(".gallery-marquee-dsk-dual");
  const trackA = dual?.querySelector<HTMLElement>('[data-marquee-row="a"]');
  const trackB = dual?.querySelector<HTMLElement>('[data-marquee-row="b"]');

  if (!single || !dual || !trackA || !trackB) return;

  if (!window.matchMedia(LG).matches) {
    single.classList.remove("hidden");
    dual.classList.add("hidden");
    return;
  }

  const shellW = shell.clientWidth;
  if (shellW <= 0) return;

  dual.classList.remove("hidden");
  dual.setAttribute("aria-hidden", "true");
  const prevVis = dual.style.visibility;
  const prevPos = dual.style.position;
  const prevLeft = dual.style.left;
  const prevWidth = dual.style.width;
  dual.style.visibility = "hidden";
  dual.style.position = "absolute";
  dual.style.left = "-200vw";
  dual.style.width = `${shellW}px`;

  const wA = measureMarqueeTrackSegmentWidth(trackA);
  const wB = measureMarqueeTrackSegmentWidth(trackB);

  dual.style.visibility = prevVis;
  dual.style.position = prevPos;
  dual.style.left = prevLeft;
  dual.style.width = prevWidth;
  dual.removeAttribute("aria-hidden");

  const useDual = shouldUseDualDesktopRows(wA, wB, shellW);

  if (useDual) {
    single.classList.add("hidden");
    dual.classList.remove("hidden");
  } else {
    single.classList.remove("hidden");
    dual.classList.add("hidden");
  }
}

let resizeObserver: ResizeObserver | null = null;
let scheduled = false;

function scheduleUpdate(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    document
      .querySelectorAll<HTMLElement>(
        "[data-gallery-marquee-shell][data-desktop-split-capable]",
      )
      .forEach(updateShell);
  });
}

function onMediaChange(): void {
  scheduleUpdate();
}

export function mountGalleryMarqueeDesktop(): void {
  destroyGalleryMarqueeDesktop();

  const shells = document.querySelectorAll<HTMLElement>(
    "[data-gallery-marquee-shell][data-desktop-split-capable]",
  );
  if (shells.length === 0) return;

  resizeObserver = new ResizeObserver(() => scheduleUpdate());

  shells.forEach((shell) => {
    resizeObserver?.observe(shell);
    shell.querySelectorAll("img").forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", scheduleUpdate, { once: true });
      }
    });
  });

  mediaMq?.addEventListener("change", onMediaChange);

  scheduleUpdate();
}

export function destroyGalleryMarqueeDesktop(): void {
  resizeObserver?.disconnect();
  resizeObserver = null;
  mediaMq?.removeEventListener("change", onMediaChange);
}

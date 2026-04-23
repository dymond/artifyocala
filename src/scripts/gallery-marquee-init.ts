import {
  destroyGalleryMarqueeDesktop,
  mountGalleryMarqueeDesktop,
} from "./gallery-marquee-desktop";
import {
  destroyGalleryMarqueeShellSpeedForDocument,
  mountGalleryMarqueeShellSpeedForDocument,
} from "./gallery-marquee-speed";

function init() {
  if (typeof document === "undefined") return;
  mountGalleryMarqueeShellSpeedForDocument();
  mountGalleryMarqueeDesktop();
}

function teardown() {
  destroyGalleryMarqueeShellSpeedForDocument();
  destroyGalleryMarqueeDesktop();
}

init();
document.addEventListener("astro:page-load", init);
document.addEventListener("astro:before-swap", teardown);


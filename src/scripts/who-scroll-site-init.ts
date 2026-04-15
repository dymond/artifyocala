/**
 * Mount the Who-section WebGL backdrop on static pages (see `who-scroll-site-sync.ts`).
 */
import { syncWhoArchBackdropForRoute } from "./who-scroll-site-sync";

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    window.addEventListener(
      "DOMContentLoaded",
      () => syncWhoArchBackdropForRoute(),
      { once: true },
    );
  } else {
    syncWhoArchBackdropForRoute();
  }
  document.addEventListener("astro:page-load", syncWhoArchBackdropForRoute);
}

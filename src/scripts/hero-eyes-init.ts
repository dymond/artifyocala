import { bindHeroEyes } from "../lib/hero-eyes-dom";

function init(): void {
  bindHeroEyes();
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
  // Support Astro's client router / view transitions if enabled.
  document.addEventListener("astro:page-load", init);
}


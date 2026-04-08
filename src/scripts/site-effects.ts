import { mountProgramCardsTilt } from "./program-cards-tilt";
import { setupWhoArchBackdrop } from "./who-scroll-client";

function runOnce(): void {
  // These functions are written to no-op safely if the relevant DOM isn't present.
  mountProgramCardsTilt();
  setupWhoArchBackdrop();
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", runOnce, { once: true });
  } else {
    runOnce();
  }
}


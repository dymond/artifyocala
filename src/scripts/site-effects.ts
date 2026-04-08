import { setupWhoArchBackdrop } from "./who-scroll-client";

function runOnce(): void {
  // Program cards tilt runs from program-cards-tilt-init.ts (separate bundle).
  setupWhoArchBackdrop();
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", runOnce, { once: true });
  } else {
    runOnce();
  }
}


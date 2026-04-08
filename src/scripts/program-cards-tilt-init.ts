/**
 * Entry for program card tilt only (separate from who-scroll / WebGL so Vite does not
 * merge Vite’s preload helper + tilt + dynamic who-arch into one fragile esbuild chunk).
 */
import { mountProgramCardsTilt } from "./program-cards-tilt";

function runOnce(): void {
  mountProgramCardsTilt();
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", runOnce, { once: true });
  } else {
    runOnce();
  }
}

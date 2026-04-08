function runOnce(): void {
  // Intentionally empty.
  // Program cards tilt runs from program-cards-tilt-init.ts (separate bundle).
  // Who backdrop is currently disabled for Netlify builds due to CI-only esbuild
  // parse failures in the generated who-scroll-client chunk.
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", runOnce, { once: true });
  } else {
    runOnce();
  }
}


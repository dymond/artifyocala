/**
 * Who-section WebGL: mount `who-arch-backdrop` when #who nears the viewport.
 *
 * We use a static import (not dynamic `import()`) so Vite never injects
 * __vitePreload/__vite__mapDeps — Netlify’s esbuild pass fails on that helper.
 * Three.js is code-split into its own chunk via `manualChunks` in `astro.config.mjs`.
 */

import { mountWhoArchBackdrop, unmountWhoArchBackdrop } from "./who-arch-backdrop";

let gen = 0;
let whoIo: IntersectionObserver | null = null;
let whoMounted = false;

export function teardownWhoArchBackdrop(): void {
  gen += 1;
  whoIo?.disconnect();
  whoIo = null;
  if (whoMounted) {
    unmountWhoArchBackdrop();
    whoMounted = false;
  }
}

/** Mount WebGL backdrop when #who nears the viewport (matches WhoScrollArch.astro). */
export function setupWhoArchBackdrop(): void {
  if (!("document" in globalThis)) return;
  const doc = globalThis.document;
  if (!doc) return;

  teardownWhoArchBackdrop();

  const who = doc.getElementById("who");
  if (!who) return;

  const kickoff = (): void => {
    if (whoMounted) return;
    const before = gen;
    mountWhoArchBackdrop();
    if (before !== gen) {
      unmountWhoArchBackdrop();
      return;
    }
    whoMounted = true;
  };

  if (!("IntersectionObserver" in globalThis)) {
    kickoff();
    return;
  }

  whoIo = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      whoIo?.disconnect();
      whoIo = null;
      kickoff();
    },
    { root: null, rootMargin: "280px 0px 320px 0px", threshold: 0 },
  );
  whoIo.observe(who);
}

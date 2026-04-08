/**
 * Who-section WebGL: load `three` + backdrop only after #who nears the viewport.
 * A static import of `who-arch-backdrop` would pull Three.js into the main bundle.
 */

let gen = 0;
let whoIo: IntersectionObserver | null = null;
let whoMounted = false;
let whoMod: typeof import("./who-arch-backdrop") | null = null;

export function teardownWhoArchBackdrop(): void {
  gen += 1;
  whoIo?.disconnect();
  whoIo = null;
  if (whoMounted && whoMod) {
    whoMod.unmountWhoArchBackdrop();
    whoMounted = false;
    whoMod = null;
  }
}

/** Mount WebGL backdrop when #who nears the viewport (matches WhoScrollArch.astro). */
export function setupWhoArchBackdrop(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  teardownWhoArchBackdrop();

  const who = document.getElementById("who");
  if (!who) return;

  const captured = gen;

  const kickoff = (): void => {
    void (async () => {
      if (whoMounted) return;
      const mod = await import("./who-arch-backdrop");
      if (captured !== gen) return;
      mod.mountWhoArchBackdrop();
      whoMod = mod;
      whoMounted = true;
    })();
  };

  if (!("IntersectionObserver" in window)) {
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

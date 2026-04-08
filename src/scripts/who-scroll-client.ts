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
  // Avoid `typeof x === "undefined"` — some CI esbuild passes rewrite it to `typeof x>"u"`
  // and a later parse step fails with `Syntax error "d"` around `document`.
  if (!("document" in globalThis)) return;
  const doc = globalThis.document;
  if (!doc) return;

  teardownWhoArchBackdrop();

  const who = doc.getElementById("who");
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

import {
  mountWhoArchBackdrop,
  unmountWhoArchBackdrop,
} from "./who-arch-backdrop";

let whoIo: IntersectionObserver | null = null;
let whoMounted = false;

export function teardownWhoArchBackdrop(): void {
  whoIo?.disconnect();
  whoIo = null;
  if (whoMounted) {
    unmountWhoArchBackdrop();
    whoMounted = false;
  }
}

/** Mount WebGL backdrop when #who nears the viewport (matches WhoScrollArch.astro). */
export function setupWhoArchBackdrop(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  teardownWhoArchBackdrop();

  const who = document.getElementById("who");
  if (!who) return;

  const kickoff = (): void => {
    if (whoMounted) return;
    mountWhoArchBackdrop();
    whoMounted = true;
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

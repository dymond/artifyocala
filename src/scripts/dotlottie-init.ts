import { DotLottie } from "@lottiefiles/dotlottie-web";

type DotLottieCanvasEl = HTMLCanvasElement & {
  __artifyDotLottie?: DotLottie;
  __artifyDotLottieRO?: ResizeObserver;
  __artifyDotLottieLastFrame?: number;
  __artifyDotLottieSawHigh?: boolean;
  __artifyDotLottieLastRotateAt?: number;
};

// Self-host the WASM runtime so the public site doesn't depend on external CDNs
// (and stays compatible with our strict CSP).
DotLottie.setWasmUrl("/vendor/dotlottie-player.wasm");

function pickTriangularCentered(min: number, max: number): number {
  // Triangular distribution centered on midpoint:
  // average of two uniforms peaks at 0.5.
  const t = (Math.random() + Math.random()) / 2;
  return min + (max - min) * t;
}

function applyRandomRotationForCanvas(canvas: DotLottieCanvasEl): void {
  const enabled = canvas.dataset.dotlottieRandomRotate === "1";
  if (!enabled) return;

  const wrapper = canvas.closest<HTMLElement>("[data-dotlottie-rotate-wrapper]");
  if (!wrapper) return;

  const min = Number(canvas.dataset.dotlottieRotateMin ?? "10");
  const max = Number(canvas.dataset.dotlottieRotateMax ?? "45");

  const safeMin = Number.isFinite(min) ? min : 10;
  const safeMax = Number.isFinite(max) ? max : 45;
  const lo = Math.min(safeMin, safeMax);
  const hi = Math.max(safeMin, safeMax);

  const angle = pickTriangularCentered(lo, hi);
  wrapper.style.transform = `rotate(${angle.toFixed(3)}deg)`;
  wrapper.style.transformOrigin = "50% 0%";
  wrapper.style.transition = "transform 220ms ease-out";
}

function normalizeMode(
  mode: string | undefined,
): "forward" | "reverse" | "bounce" | "reverse-bounce" | undefined {
  if (!mode) return undefined;

  // Back-compat with earlier iterations.
  if (mode === "bounce-reverse") return "reverse-bounce";

  if (
    mode === "forward" ||
    mode === "reverse" ||
    mode === "bounce" ||
    mode === "reverse-bounce"
  ) {
    return mode;
  }

  return undefined;
}

function setCanvasSize(canvas: HTMLCanvasElement): void {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w) canvas.width = w;
  if (canvas.height !== h) canvas.height = h;
}

const layoutWaitObservers = new WeakMap<DotLottieCanvasEl, ResizeObserver>();

function canLayoutLottieCanvas(canvas: HTMLCanvasElement): boolean {
  const r = canvas.getBoundingClientRect();
  return r.width >= 2 && r.height >= 2;
}

function clearLayoutWait(canvas: DotLottieCanvasEl): void {
  const ro = layoutWaitObservers.get(canvas);
  if (ro) {
    ro.disconnect();
    layoutWaitObservers.delete(canvas);
  }
}

function mountDotLottieCanvas(canvas: DotLottieCanvasEl): void {
  const src = canvas.dataset.dotlottieSrc;
  if (!src) return;

  // Idempotent.
  if (canvas.__artifyDotLottie) return;

  clearLayoutWait(canvas);

  if (!canLayoutLottieCanvas(canvas)) return;

  setCanvasSize(canvas);

  const loop = canvas.dataset.dotlottieLoop !== "0";
  const autoplay = canvas.dataset.dotlottieAutoplay !== "0";
  const speed = Number(canvas.dataset.dotlottieSpeed ?? "1") || 1;
  const mode = normalizeMode(canvas.dataset.dotlottieMode);

  const player = new DotLottie({
    canvas,
    src,
    loop,
    autoplay,
    speed,
    ...(mode ? { mode } : {}),
  });

  canvas.__artifyDotLottie = player;

  // Ensure first frame renders; only safe after load completes.
  player.addEventListener("load", () => {
    applyRandomRotationForCanvas(canvas);
    player.setFrame(0);
    if (autoplay) player.play();
  });

  player.addEventListener("loop", () => {
    applyRandomRotationForCanvas(canvas);
  });

  // Fallback: some animations/modes don't emit `loop` reliably (especially bounce/ping-pong).
  // We treat "back near frame 0 after we've seen the high end" as the start of a new cycle.
  const maybeRotateOnCycleStart = (currentFrame: number) => {
    const now = performance.now();
    const lastRotate = canvas.__artifyDotLottieLastRotateAt ?? 0;

    // Prevent multiple triggers while lingering near frame 0.
    if (now - lastRotate < 250) return;

    const totalFrames = player.totalFrames || 0;
    const lowMark = 1;
    const highMark =
      totalFrames > 0 ? Math.max(5, Math.floor(totalFrames * 0.65)) : 30;

    if (currentFrame >= highMark) {
      canvas.__artifyDotLottieSawHigh = true;
      return;
    }

    if (currentFrame <= lowMark && canvas.__artifyDotLottieSawHigh) {
      canvas.__artifyDotLottieSawHigh = false;
      canvas.__artifyDotLottieLastRotateAt = now;
      applyRandomRotationForCanvas(canvas);
    }
  };

  player.addEventListener("frame", (e) => {
    canvas.__artifyDotLottieLastFrame = e.currentFrame;
    maybeRotateOnCycleStart(e.currentFrame);
  });

  // Some builds emit `render` more reliably than `frame`.
  player.addEventListener("render", (e) => {
    maybeRotateOnCycleStart(e.currentFrame);
  });

  const ro = new ResizeObserver(() => {
    setCanvasSize(canvas);
    player.resize();
  });
  ro.observe(canvas);
  canvas.__artifyDotLottieRO = ro;
}

function initDotLottieCanvas(canvas: DotLottieCanvasEl): void {
  const src = canvas.dataset.dotlottieSrc;
  if (!src) return;
  if (canvas.__artifyDotLottie) {
    clearLayoutWait(canvas);
    return;
  }

  if (canLayoutLottieCanvas(canvas)) {
    mountDotLottieCanvas(canvas);
    return;
  }

  if (layoutWaitObservers.has(canvas)) return;

  const ro = new ResizeObserver(() => {
    if (!canLayoutLottieCanvas(canvas)) return;
    mountDotLottieCanvas(canvas);
  });
  ro.observe(canvas);
  layoutWaitObservers.set(canvas, ro);

  requestAnimationFrame(() => {
    if (canLayoutLottieCanvas(canvas)) {
      mountDotLottieCanvas(canvas);
    }
  });
}

function initAll(): void {
  const canvases = document.querySelectorAll<DotLottieCanvasEl>(
    "canvas[data-dotlottie-src]",
  );
  for (const canvas of canvases) initDotLottieCanvas(canvas);
}

function collectLottieCanvasesFromNode(node: Node): DotLottieCanvasEl[] {
  if (node instanceof HTMLCanvasElement && node.dataset.dotlottieSrc) {
    return [node];
  }
  if (node instanceof Element) {
    return Array.from(
      node.querySelectorAll<DotLottieCanvasEl>("canvas[data-dotlottie-src]"),
    );
  }
  return [];
}

let mutationFlushPending = false;
function requestInitFromMutations(): void {
  if (mutationFlushPending) return;
  mutationFlushPending = true;
  requestAnimationFrame(() => {
    mutationFlushPending = false;
    initAll();
  });
}

/** Catch canvases that mount or resize after the first `initAll` (common on mobile + dev HMR). */
function observeLottieCanvases(): void {
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      for (const n of m.addedNodes) {
        if (collectLottieCanvasesFromNode(n).length) {
          requestInitFromMutations();
          return;
        }
      }
    }
  });
  mo.observe(document.documentElement, { childList: true, subtree: true });
}

document.addEventListener("astro:page-load", initAll);
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll);
} else {
  initAll();
}

if (typeof window !== "undefined") {
  // Full load: fonts, late layout, async chunks (Vite / islands) may settle after `DOMContentLoaded`.
  window.addEventListener("load", initAll, { once: true });
  // Two rAFs: catch first paint + layout for canvases in responsive/flex grids.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initAll();
    });
  });
  observeLottieCanvases();
}


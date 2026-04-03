/**
 * Interactive tilt for #programs “What we do” cards (pointer: fine only):
 * follow cursor, straighten when approaching, full upright + lift on hover.
 */

export type ProgramCardsTiltHandle = {
  destroy: () => void;
};

/** Keep small — cursor tracking multiplies these; large values feel “swimmy”. */
const MAX_RX = 4.5;
const MAX_RY = 6;
const PROXIMITY_PX = 200;
const LERP = 0.11;
const MOUSE_NORM_X = 0.82;
const MOUSE_NORM_Y = 0.82;
const MOUSE_NORM_MIN = 220;

const SHADOW: Record<string, { rest: string; hover: string }> = {
  buzz: {
    rest: '8px 8px 0 0 rgba(176, 184, 255, 0.28)',
    hover: '14px 22px 0 0 rgba(176, 184, 255, 0.5)',
  },
  club: {
    rest: '8px 8px 0 0 rgba(165, 158, 255, 0.3)',
    hover: '14px 22px 0 0 rgba(165, 158, 255, 0.48)',
  },
  surge: {
    rest: '8px 8px 0 0 rgba(107, 100, 201, 0.28)',
    hover: '14px 22px 0 0 rgba(107, 100, 201, 0.42)',
  },
};

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n));
}

function smoothstep01(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function distPointToRect(px: number, py: number, r: DOMRect): number {
  const cx = clamp(px, r.left, r.right);
  const cy = clamp(py, r.top, r.bottom);
  return Math.hypot(px - cx, py - cy);
}

function isInside(px: number, py: number, r: DOMRect): boolean {
  return px >= r.left && px <= r.right && py >= r.top && py <= r.bottom;
}

export function mountProgramCardsTilt(root?: ParentNode): ProgramCardsTiltHandle {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return { destroy: () => {} };
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return { destroy: () => {} };
  }
  if (window.matchMedia('(pointer: coarse)').matches) {
    return { destroy: () => {} };
  }

  const scope = root ?? document;
  const grid = scope.querySelector('.artify-program-card-grid');
  const nodes = grid?.querySelectorAll<HTMLElement>('[data-artify-program-tilt]');
  if (!nodes?.length) {
    return { destroy: () => {} };
  }

  type State = {
    el: HTMLElement;
    baseZ: number;
    theme: string;
    rx: number;
    ry: number;
    rz: number;
    ty: number;
    tz: number;
    /** Shadow transition only when hover crosses; avoid resetting every frame. */
    wasInside: boolean | undefined;
  };

  const states: State[] = [...nodes].map((el) => ({
    el,
    baseZ: Number.parseFloat(el.dataset.tiltBaseZ ?? '0'),
    theme: el.dataset.tiltTheme ?? 'buzz',
    rx: 0,
    ry: 0,
    rz: 0,
    ty: 0,
    tz: 0,
    wasInside: undefined,
  }));

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let raf = 0;
  let running = true;

  const onMove = (e: MouseEvent): void => {
    mx = e.clientX;
    my = e.clientY;
  };

  const tick = (): void => {
    if (!running) return;

    for (const s of states) {
      const r = s.el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const inside = isInside(mx, my, r);
      const shadows = SHADOW[s.theme] ?? SHADOW.buzz;

      let trx: number;
      let try_: number;
      let trz: number;
      let tty: number;
      let ttz: number;

      if (inside) {
        trx = 0;
        try_ = 0;
        trz = 0;
        tty = -5;
        ttz = 10;
        if (inside !== s.wasInside) {
          s.el.style.boxShadow = shadows.hover;
          s.wasInside = inside;
        }
      } else {
        if (inside !== s.wasInside) {
          s.el.style.boxShadow = shadows.rest;
          s.wasInside = inside;
        }
        const d = distPointToRect(mx, my, r);
        const proximity = smoothstep01(d / PROXIMITY_PX);
        const nmx = (mx - cx) / Math.max(r.width * MOUSE_NORM_X, MOUSE_NORM_MIN);
        const nmy = (my - cy) / Math.max(r.height * MOUSE_NORM_Y, MOUSE_NORM_MIN);
        const imx = clamp(nmx, -1, 1);
        const imy = clamp(nmy, -1, 1);
        try_ = imx * MAX_RY * proximity;
        trx = -imy * MAX_RX * proximity;
        trz = s.baseZ * proximity;
        tty = 0;
        ttz = 2 * proximity;
      }

      s.rx += (trx - s.rx) * LERP;
      s.ry += (try_ - s.ry) * LERP;
      s.rz += (trz - s.rz) * LERP;
      s.ty += (tty - s.ty) * LERP;
      s.tz += (ttz - s.tz) * LERP;

      s.el.style.transform = `translateY(${s.ty}px) translateZ(${s.tz}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) rotateZ(${s.rz}deg)`;
    }

    raf = requestAnimationFrame(tick);
  };

  window.addEventListener('mousemove', onMove, { passive: true });
  raf = requestAnimationFrame(tick);

  return {
    destroy: () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      for (const s of states) {
        s.el.style.transform = '';
        s.el.style.boxShadow = '';
        s.wasInside = undefined;
      }
    },
  };
}

export function unmountProgramCardsTilt(handle: ProgramCardsTiltHandle | null): void {
  handle?.destroy();
}

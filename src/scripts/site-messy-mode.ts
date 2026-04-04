import { MESSY_PALETTE_CSS_VARS, paletteIndexFromPointer } from '../lib/site-messy-palette';

const CANVAS_ID = 'artify-messy-canvas';
const TAP_MOVE_THRESHOLD_PX = 14;
const MIN_BRUSH_SEGMENT_PX = 1.5;

export type ArtifyMessyStudioApi = {
  setEnabled: (v: boolean) => void;
  clear: () => void;
  isEnabled: () => boolean;
};

declare global {
  interface Window {
    artifyMessyStudio?: ArtifyMessyStudioApi;
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function resolveCssColor(cssVar: string): string {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  if (!raw) return '#8c92e3';
  return raw;
}

function pickColor(clientX: number, clientY: number): string {
  const i = paletteIndexFromPointer(clientX, clientY, MESSY_PALETTE_CSS_VARS.length);
  return resolveCssColor(MESSY_PALETTE_CSS_VARS[i]);
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let enabled = false;
let inited = false;
let drawing = false;
let brushUsed = false;
let lastX = 0;
let lastY = 0;
let startX = 0;
let startY = 0;
let dprActive = 1;

function syncToggleUi(): void {
  const toggle = document.getElementById('artify-studio-mode-toggle') as HTMLButtonElement | null;
  const clearBtn = document.getElementById('artify-studio-mode-clear') as HTMLButtonElement | null;
  if (toggle) {
    toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    toggle.textContent = enabled ? 'Studio on' : 'Studio';
    toggle.setAttribute(
      'aria-label',
      enabled
        ? 'Turn off studio mode'
        : 'Turn on studio mode: splatter paint on the page with click or drag',
    );
  }
  if (clearBtn) {
    clearBtn.hidden = !enabled;
    clearBtn.setAttribute('aria-hidden', enabled ? 'false' : 'true');
  }
  document.documentElement.dataset.artifyMessyStudio = enabled ? 'on' : 'off';
}

function resize(): void {
  if (!canvas) return;
  dprActive = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dprActive);
  canvas.height = Math.floor(h * dprActive);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const c = canvas.getContext('2d');
  if (c) {
    c.setTransform(dprActive, 0, 0, dprActive, 0, 0);
    ctx = c;
  }
}

function clearCanvas(): void {
  if (!canvas || !ctx) return;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function drawSplat(px: number, py: number): void {
  if (!ctx) return;
  const color = pickColor(px, py);
  const baseR = 16 + Math.random() * 20;
  ctx.save();
  const g = ctx.createRadialGradient(px, py, 0, px, py, baseR);
  g.addColorStop(0, color);
  g.addColorStop(0.55, color);
  g.addColorStop(1, 'rgba(28, 28, 51, 0)');
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(px, py, baseR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.58;
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = baseR * (0.3 + Math.random() * 0.55);
    ctx.beginPath();
    ctx.arc(px + Math.cos(a) * d, py + Math.sin(a) * d, 2 + Math.random() * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function strokeSegment(x0: number, y0: number, x1: number, y1: number): void {
  if (!ctx) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 9 + Math.random() * 2;
  ctx.strokeStyle = pickColor(x1, y1);
  ctx.globalAlpha = 0.82;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

function onPointerDown(e: PointerEvent): void {
  if (!enabled || !canvas || e.button !== 0) return;
  drawing = true;
  brushUsed = false;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  startX = x;
  startY = y;
  lastX = x;
  lastY = y;
  canvas.setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent): void {
  if (!drawing || !canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const d = Math.hypot(x - lastX, y - lastY);
  if (d >= MIN_BRUSH_SEGMENT_PX) {
    brushUsed = true;
    strokeSegment(lastX, lastY, x, y);
    lastX = x;
    lastY = y;
  }
}

function onPointerUp(e: PointerEvent): void {
  if (!canvas) return;
  try {
    canvas.releasePointerCapture(e.pointerId);
  } catch {
    /* ignore */
  }
  if (!drawing) return;
  drawing = false;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const totalMove = Math.hypot(x - startX, y - startY);
  if (!brushUsed && totalMove < TAP_MOVE_THRESHOLD_PX) {
    drawSplat(startX, startY);
  }
}

function onKeyDown(e: KeyboardEvent): void {
  if (!enabled) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    setEnabled(false);
  }
}

function bindCanvas(): void {
  if (!canvas) return;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
}

function wireChrome(): void {
  const toggle = document.getElementById('artify-studio-mode-toggle');
  const clearBtn = document.getElementById('artify-studio-mode-clear');
  toggle?.addEventListener('click', () => {
    setEnabled(!enabled);
  });
  clearBtn?.addEventListener('click', () => {
    clearCanvas();
  });
}

export function setEnabled(v: boolean): void {
  enabled = v;
  if (canvas) {
    canvas.style.pointerEvents = v ? 'auto' : 'none';
    canvas.style.cursor = v ? 'crosshair' : 'default';
    canvas.setAttribute('data-active', v ? 'true' : 'false');
  }
  document.body.classList.toggle('artify-messy-studio-active', v);
  syncToggleUi();
}

export function clearMessyCanvas(): void {
  clearCanvas();
}

export function isMessyStudioEnabled(): boolean {
  return enabled;
}

export function initMessyStudioMode(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (inited) return;
  inited = true;
  if (prefersReducedMotion()) return;

  canvas = document.createElement('canvas');
  canvas.id = CANVAS_ID;
  canvas.className = 'artify-messy-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.pointerEvents = 'none';
  canvas.style.cursor = 'default';
  document.body.appendChild(canvas);

  resize();
  window.addEventListener('resize', resize);
  bindCanvas();
  document.addEventListener('keydown', onKeyDown);
  wireChrome();

  window.artifyMessyStudio = {
    setEnabled,
    clear: clearMessyCanvas,
    isEnabled: isMessyStudioEnabled,
  };

  syncToggleUi();
}

import { MESSY_PALETTE_CSS_VARS, paletteIndexFromPointer } from '../lib/site-messy-palette';
import {
  isExcludedFromStudioDamage,
  STUDIO_DAMAGE_DAB_CLASS,
  STUDIO_DAMAGE_MARK_CLASS,
} from '../lib/site-messy-damage';

const CANVAS_ID = 'artify-messy-canvas';
const TAP_MOVE_THRESHOLD_PX = 14;
const MIN_BRUSH_SEGMENT_PX = 2;
const DAMAGE_HOST_CLASS = 'artify-damage-host';
const SAW_DAMAGE_CLASS = 'artify-saw-damaged';

export type StudioTool = 'paint' | 'saw';

export type ArtifyMessyStudioApi = {
  setEnabled: (v: boolean) => void;
  clear: () => void;
  isEnabled: () => boolean;
  setTool: (t: StudioTool) => void;
  getTool: () => StudioTool;
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
let tool: StudioTool = 'paint';
let drawing = false;
let brushUsed = false;
let lastX = 0;
let lastY = 0;
let startX = 0;
let startY = 0;
let sawStartX = 0;
let sawStartY = 0;
let dprActive = 1;

function pickDamageTarget(clientX: number, clientY: number): Element | null {
  if (!canvas) return null;
  const prev = canvas.style.pointerEvents;
  canvas.style.pointerEvents = 'none';
  const stack = document.elementsFromPoint(clientX, clientY);
  canvas.style.pointerEvents = prev || 'auto';

  for (const node of stack) {
    if (!(node instanceof Element)) continue;
    if (isExcludedFromStudioDamage(node)) continue;
    return node;
  }
  return null;
}

function ensureDamageHost(el: Element): void {
  if (!(el instanceof HTMLElement)) return;
  const pos = getComputedStyle(el).position;
  if (pos === 'static') {
    el.classList.add(DAMAGE_HOST_CLASS);
  }
}

function injectSplat(clientX: number, clientY: number): void {
  const target = pickDamageTarget(clientX, clientY);
  if (!target || !(target instanceof HTMLElement)) return;

  ensureDamageHost(target);

  const rect = target.getBoundingClientRect();
  const lx = clientX - rect.left;
  const ly = clientY - rect.top;
  const color = pickColor(clientX, clientY);
  const size = 36 + Math.random() * 28;

  const mark = document.createElement('div');
  mark.className = STUDIO_DAMAGE_MARK_CLASS;
  mark.setAttribute('aria-hidden', 'true');
  mark.style.setProperty('--artify-splat-color', color);
  mark.style.setProperty('--artify-splat-size', `${size}px`);
  mark.style.setProperty('--artify-splat-rot', `${-14 + Math.random() * 28}deg`);
  mark.style.left = `${lx}px`;
  mark.style.top = `${ly}px`;

  target.appendChild(mark);
}

function injectDab(clientX: number, clientY: number): void {
  const target = pickDamageTarget(clientX, clientY);
  if (!target || !(target instanceof HTMLElement)) return;

  ensureDamageHost(target);

  const rect = target.getBoundingClientRect();
  const lx = clientX - rect.left;
  const ly = clientY - rect.top;
  const color = pickColor(clientX, clientY);
  const w = 7 + Math.random() * 5;
  const h = 6 + Math.random() * 4;

  const dab = document.createElement('div');
  dab.className = STUDIO_DAMAGE_DAB_CLASS;
  dab.setAttribute('aria-hidden', 'true');
  dab.style.setProperty('--artify-dab-color', color);
  dab.style.setProperty('--artify-dab-w', `${w}px`);
  dab.style.setProperty('--artify-dab-h', `${h}px`);
  dab.style.left = `${lx}px`;
  dab.style.top = `${ly}px`;

  target.appendChild(dab);
}

function applySawAlongLine(x0: number, y0: number, x1: number, y1: number): void {
  const len = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(8, Math.min(40, Math.ceil(len / 24)));
  const seen = new Set<Element>();

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    const el = pickDamageTarget(x, y);
    if (!el || !(el instanceof HTMLElement)) continue;
    if (seen.has(el)) continue;
    seen.add(el);

    const hits = Math.min(6, Number(el.getAttribute('data-artify-saw-hits') || 0) + 1);
    el.setAttribute('data-artify-saw-hits', String(hits));
    const rot = -2 - hits * 2.2 - Math.random() * 3;
    const tx = -5 + Math.random() * 10;
    const ty = 4 + hits * 3 + Math.random() * 6;
    el.style.setProperty('--artify-saw-rot', `${rot}deg`);
    el.style.setProperty('--artify-saw-tx', `${tx}px`);
    el.style.setProperty('--artify-saw-ty', `${ty}px`);
    el.classList.add(SAW_DAMAGE_CLASS);
  }
}

function clearSawPreview(): void {
  if (!canvas) return;
  const c = canvas.getContext('2d');
  if (!c) return;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, canvas.width, canvas.height);
  c.setTransform(dprActive, 0, 0, dprActive, 0, 0);
  ctx = c;
}

function drawSawPreview(x0: number, y0: number, x1: number, y1: number): void {
  if (!ctx || !canvas || tool !== 'saw') return;
  clearSawPreview();
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 90, 90, 0.92)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.restore();
}

function syncToggleUi(): void {
  const toggle = document.getElementById('artify-studio-mode-toggle') as HTMLButtonElement | null;
  const clearBtn = document.getElementById('artify-studio-mode-clear') as HTMLButtonElement | null;
  const toolBtn = document.getElementById('artify-studio-tool-toggle') as HTMLButtonElement | null;

  if (toggle) {
    toggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    toggle.textContent = enabled ? 'Studio on' : 'Studio';
    toggle.setAttribute(
      'aria-label',
      enabled
        ? 'Turn off studio mode'
        : 'Turn on studio mode: paint or cut elements on the page',
    );
  }
  if (clearBtn) {
    clearBtn.hidden = !enabled;
    clearBtn.setAttribute('aria-hidden', enabled ? 'false' : 'true');
  }
  if (toolBtn) {
    toolBtn.hidden = !enabled;
    toolBtn.setAttribute('aria-hidden', enabled ? 'false' : 'true');
    toolBtn.textContent = tool === 'saw' ? 'Saw' : 'Paint';
    toolBtn.setAttribute(
      'aria-label',
      tool === 'saw'
        ? 'Switch to paint brush (click or drag on elements)'
        : 'Switch to saw (drag across elements to chop)',
    );
  }
  document.documentElement.dataset.artifyMessyStudio = enabled ? 'on' : 'off';
  document.documentElement.dataset.artifyMessyTool = tool;
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

function onPointerDown(e: PointerEvent): void {
  if (!enabled || !canvas || e.button !== 0) return;
  drawing = true;
  brushUsed = false;
  const x = e.clientX;
  const y = e.clientY;
  startX = x;
  startY = y;
  lastX = x;
  lastY = y;
  sawStartX = x;
  sawStartY = y;
  canvas.setPointerCapture(e.pointerId);

  if (tool === 'saw') {
    clearSawPreview();
  }
}

function onPointerMove(e: PointerEvent): void {
  if (!drawing || !canvas) return;
  const x = e.clientX;
  const y = e.clientY;

  if (tool === 'saw') {
    drawSawPreview(sawStartX, sawStartY, x, y);
    return;
  }

  const d = Math.hypot(x - lastX, y - lastY);
  if (d >= MIN_BRUSH_SEGMENT_PX) {
    brushUsed = true;
    const mx = (lastX + x) / 2;
    const my = (lastY + y) / 2;
    injectDab(mx, my);
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

  const x = e.clientX;
  const y = e.clientY;

  if (tool === 'saw') {
    clearSawPreview();
    applySawAlongLine(sawStartX, sawStartY, x, y);
    return;
  }

  const totalMove = Math.hypot(x - startX, y - startY);
  if (!brushUsed && totalMove < TAP_MOVE_THRESHOLD_PX) {
    injectSplat(startX, startY);
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
  const toolBtn = document.getElementById('artify-studio-tool-toggle');

  toggle?.addEventListener('click', () => {
    setEnabled(!enabled);
  });
  clearBtn?.addEventListener('click', () => {
    clearAllDamage();
  });
  toolBtn?.addEventListener('click', () => {
    setTool(tool === 'paint' ? 'saw' : 'paint');
  });
}

function clearAllDamage(): void {
  document.querySelectorAll(`.${STUDIO_DAMAGE_MARK_CLASS}`).forEach((n) => n.remove());
  document.querySelectorAll(`.${STUDIO_DAMAGE_DAB_CLASS}`).forEach((n) => n.remove());
  document.querySelectorAll(`.${SAW_DAMAGE_CLASS}`).forEach((el) => {
    el.classList.remove(SAW_DAMAGE_CLASS);
    el.removeAttribute('data-artify-saw-hits');
    if (el instanceof HTMLElement) {
      el.style.removeProperty('--artify-saw-rot');
      el.style.removeProperty('--artify-saw-tx');
      el.style.removeProperty('--artify-saw-ty');
    }
  });
  document.querySelectorAll(`.${DAMAGE_HOST_CLASS}`).forEach((el) => {
    el.classList.remove(DAMAGE_HOST_CLASS);
  });
  clearSawPreview();
}

export function setTool(t: StudioTool): void {
  tool = t;
  if (canvas) {
    canvas.dataset.tool = t;
    canvas.style.cursor = t === 'saw' ? 'cell' : 'crosshair';
  }
  syncToggleUi();
}

export function getTool(): StudioTool {
  return tool;
}

export function setEnabled(v: boolean): void {
  enabled = v;
  if (canvas) {
    canvas.style.pointerEvents = v ? 'auto' : 'none';
    canvas.style.cursor = v ? (tool === 'saw' ? 'cell' : 'crosshair') : 'default';
    canvas.setAttribute('data-active', v ? 'true' : 'false');
  }
  document.body.classList.toggle('artify-messy-studio-active', v);
  if (!v) {
    clearSawPreview();
  }
  syncToggleUi();
}

export function clearMessyCanvas(): void {
  clearAllDamage();
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
  canvas.dataset.tool = tool;
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
    setTool,
    getTool,
  };

  syncToggleUi();
}

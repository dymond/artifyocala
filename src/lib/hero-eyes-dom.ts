import {
  HERO_EYE_CLAMP,
  HERO_EYE_PUPIL_Y_BIAS_PX,
  offsetTowardPointClamped,
} from "./hero-eyes";

export function bindHeroEyes(root?: HTMLElement | null): () => void {
  const host =
    root ?? document.querySelector<HTMLElement>("[data-artify-hero-eyes]");
  if (!host) return () => {};

  const key = "__artifyHeroEyesInit";
  const prev = (host as any)[key] as (() => void) | true | undefined;
  if (typeof prev === "function") {
    // Re-init: tear down previous listeners first so hover/kiss animations
    // don't fight each other (Tina preview + public init can overlap).
    prev();
  } else if (prev === true) {
    // Already bound, no teardown handle available (shouldn't happen, but safe).
    return () => {};
  }

  const pupils = host.querySelectorAll<HTMLElement>(".artify-hero-pupil");
  if (pupils.length === 0) return () => {};

  const hoverClass = "artify-hero-eyes--hover";
  let hoverOffTimer: number | undefined;

  /** Real hover: mouse/trackpad. Touch uses click-only kiss so we avoid sticky :hover. */
  const prefersFinePointerHover = (): boolean =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const setHover = (on: boolean): void => {
    if (hoverOffTimer !== undefined) window.clearTimeout(hoverOffTimer);
    hoverOffTimer = undefined;
    if (on) {
      host.classList.remove(hoverClass);
      void host.getBoundingClientRect();
      host.classList.add(hoverClass);
    } else {
      hoverOffTimer = window.setTimeout(() => {
        host.classList.remove(hoverClass);
        hoverOffTimer = undefined;
      }, 1200);
    }
  };

  const move = (clientX: number, clientY: number): void => {
    const rect = host.getBoundingClientRect();
    const { x, y } = offsetTowardPointClamped(
      clientX,
      clientY,
      rect,
      HERO_EYE_CLAMP,
    );
    const yb = y + HERO_EYE_PUPIL_Y_BIAS_PX;
    for (const el of pupils) {
      el.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${yb}px), 0)`;
    }
  };

  const onPointer = (e: PointerEvent): void => {
    move(e.clientX, e.clientY);
  };

  const reset = (): void => {
    const b = HERO_EYE_PUPIL_Y_BIAS_PX;
    for (const el of pupils) {
      el.style.transform = `translate3d(-50%, calc(-50% + ${b}px), 0)`;
    }
  };

  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("blur", reset);
  const onEnter = (): void => {
    if (prefersFinePointerHover()) setHover(true);
  };
  const onPointerLeave = (): void => {
    reset();
    if (prefersFinePointerHover()) setHover(false);
  };
  host.addEventListener("pointerenter", onEnter);
  host.addEventListener("pointerleave", onPointerLeave);

  /** Kiss on tap/click (all devices) — one-shot; CSS ~1.1s. Fine pointers also get hover-on-enter above. */
  const onKissClick = (): void => {
    if (hoverOffTimer !== undefined) window.clearTimeout(hoverOffTimer);
    setHover(true);
    hoverOffTimer = window.setTimeout(() => {
      host.classList.remove(hoverClass);
      hoverOffTimer = undefined;
    }, 1300);
  };
  host.addEventListener("click", onKissClick);

  const teardown = () => {
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("blur", reset);
    host.removeEventListener("pointerenter", onEnter);
    host.removeEventListener("pointerleave", onPointerLeave);
    host.removeEventListener("click", onKissClick);
    if (hoverOffTimer !== undefined) window.clearTimeout(hoverOffTimer);
    host.classList.remove(hoverClass);
    delete (host as any)[key];
  };

  (host as any)[key] = teardown;
  return teardown;
}


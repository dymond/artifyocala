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
  host.addEventListener("pointerleave", reset);
  const onEnter = (): void => setHover(true);
  const onLeave = (): void => setHover(false);
  host.addEventListener("pointerenter", onEnter);
  host.addEventListener("pointerleave", onLeave);
  host.addEventListener("mouseenter", onEnter);
  host.addEventListener("mouseleave", onLeave);

  const teardown = () => {
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("blur", reset);
    host.removeEventListener("pointerleave", reset);
    host.removeEventListener("pointerenter", onEnter);
    host.removeEventListener("pointerleave", onLeave);
    host.removeEventListener("mouseenter", onEnter);
    host.removeEventListener("mouseleave", onLeave);
    if (hoverOffTimer !== undefined) window.clearTimeout(hoverOffTimer);
    host.classList.remove(hoverClass);
    delete (host as any)[key];
  };

  (host as any)[key] = teardown;
  return teardown;
}


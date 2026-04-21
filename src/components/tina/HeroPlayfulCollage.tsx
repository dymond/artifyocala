import { useEffect, useMemo } from "react";
import { tinaField } from "tinacms/dist/react";
import {
  aspectInner,
  faceRound,
  heroPlayfulCollageCards,
  photoRoundBleed,
  type CardConfig,
} from "../../lib/hero-playful-collage-data";
import { cn } from "../../lib/cn";
import ResponsiveImage from "../ui/ResponsiveImage";
import {
  HERO_EYE_CLAMP,
  HERO_EYE_PUPIL_Y_BIAS_PX,
  offsetTowardPointClamped,
} from "../../lib/hero-eyes";

export type CollageCardOverride = {
  hccFrontImage?: string | null;
  hccFrontAlt?: string | null;
  hccFrontCaption?: string | null;
  hccBackImage?: string | null;
  hccBackAlt?: string | null;
  hccBackCaption?: string | null;
};

function mergeCollageCards(
  overrides?: ReadonlyArray<CollageCardOverride | null> | null,
): ReadonlyArray<CardConfig> {
  if (!overrides || overrides.length === 0) return heroPlayfulCollageCards;
  return heroPlayfulCollageCards.map((card, i) => {
    const o = overrides[i];
    if (!o) return card;
    return {
      ...card,
      front: {
        ...card.front,
        ...(o.hccFrontImage ? { src: o.hccFrontImage } : {}),
        ...(o.hccFrontAlt ? { alt: o.hccFrontAlt } : {}),
      },
      back: {
        ...card.back,
        ...(o.hccBackImage ? { src: o.hccBackImage } : {}),
        ...(o.hccBackAlt ? { alt: o.hccBackAlt } : {}),
      },
      ...(o.hccFrontCaption ? { frontCaption: o.hccFrontCaption } : {}),
      ...(o.hccBackCaption ? { backCaption: o.hccBackCaption } : {}),
    };
  });
}

function bindHeroEyes(): () => void {
  const root = document.querySelector<HTMLElement>("[data-artify-hero-eyes]");
  if (!root) return () => {};

  const pupils = root.querySelectorAll<HTMLElement>(".artify-hero-pupil");
  if (pupils.length === 0) return () => {};

  const hoverClass = "artify-hero-eyes--hover";
  let hoverOffTimer: number | undefined;

  const setHover = (on: boolean): void => {
    if (hoverOffTimer !== undefined) window.clearTimeout(hoverOffTimer);
    hoverOffTimer = undefined;
    if (on) {
      // Re-add to restart hover-triggered animations deterministically.
      root.classList.remove(hoverClass);
      void root.getBoundingClientRect();
      root.classList.add(hoverClass);
    } else {
      // Let kiss/blink finish instead of snapping mid-animation.
      hoverOffTimer = window.setTimeout(() => {
        root.classList.remove(hoverClass);
        hoverOffTimer = undefined;
      }, 1200);
    }
  };

  const move = (clientX: number, clientY: number): void => {
    const rect = root.getBoundingClientRect();
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
  root.addEventListener("pointerleave", reset);
  const onEnter = (): void => setHover(true);
  const onLeave = (): void => setHover(false);
  root.addEventListener("pointerenter", onEnter);
  root.addEventListener("pointerleave", onLeave);
  // Mouse events as a fallback when pointer events behave oddly.
  root.addEventListener("mouseenter", onEnter);
  root.addEventListener("mouseleave", onLeave);

  return () => {
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("blur", reset);
    root.removeEventListener("pointerleave", reset);
    root.removeEventListener("pointerenter", onEnter);
    root.removeEventListener("pointerleave", onLeave);
    root.removeEventListener("mouseenter", onEnter);
    root.removeEventListener("mouseleave", onLeave);
    if (hoverOffTimer !== undefined) window.clearTimeout(hoverOffTimer);
    root.classList.remove(hoverClass);
  };
}

function CardFaces({ c }: { c: CardConfig }) {
  const r = faceRound(c.variant);
  const a = aspectInner(c.variant);
  const bRound = photoRoundBleed(c.variant);

  return (
    <div className={cn("relative w-full origin-center", a)}>
      <div className="absolute inset-0 [perspective:1100px]">
        <div
          className={cn(
            "artify-hero-flip-inner absolute inset-0 min-h-0 w-full",
            c.flip,
          )}
        >
          {(c.variant === "bleed" || c.variant === "wide") && (
            <>
              <div
                className={cn(
                  "artify-hero-flip-face artify-hero-flip-face--front absolute inset-0 flex flex-col overflow-hidden border-[3px] border-ink bg-[#f4f2ea] shadow-[8px_8px_0_0_var(--color-ink)]",
                  r,
                )}
              >
                <div className="relative min-h-0 flex-1 p-1 sm:p-1.5">
                  <ResponsiveImage
                    src={c.front.src}
                    alt={c.front.alt}
                    width={c.front.width}
                    height={c.front.height}
                    loading={c.loading}
                    decoding="async"
                    fetchPriority={c.fetchPriority}
                    sizes="(min-width: 1024px) 260px, 44vw"
                    className={cn(
                      "box-border h-full w-full max-h-full border-[3px] border-ink object-cover object-center",
                      bRound,
                    )}
                  />
                </div>
                <div
                  className={cn(
                    "shrink-0 border-t-[3px] border-ink px-1.5 py-1 text-center text-[0.72rem] leading-snug sm:py-0.5 sm:text-[0.58rem] lg:text-[0.7rem] xl:text-[0.75rem]",
                    c.frontStripClass,
                  )}
                >
                  {c.frontCaption}
                </div>
              </div>
              <div
                className={cn(
                  "artify-hero-flip-face artify-hero-flip-face--back absolute inset-0 flex flex-col overflow-hidden border-[3px] border-ink bg-ink shadow-[8px_8px_0_0_var(--color-ink)]",
                  r,
                )}
              >
                <div className="relative min-h-0 flex-1 p-1 sm:p-1.5">
                  <ResponsiveImage
                    src={c.back.src}
                    alt={c.back.alt}
                    width={c.back.width}
                    height={c.back.height}
                    loading={c.loading}
                    decoding="async"
                    sizes="(min-width: 1024px) 260px, 44vw"
                    className={cn(
                      "box-border h-full w-full max-h-full border-[3px] border-mist/35 object-cover object-center",
                      bRound,
                    )}
                  />
                  <div
                    className="pointer-events-none absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-ink bg-surge text-[0.5rem] font-bold leading-none text-mist shadow-[2px_2px_0_0_var(--color-ink)]"
                    aria-hidden
                  >
                    ★
                  </div>
                </div>
                <div
                  className={cn(
                    "shrink-0 border-t-[3px] border-ink px-1.5 py-1 text-center text-[0.7rem] leading-snug sm:py-0.5 sm:text-[0.56rem] lg:text-[0.68rem] xl:text-[0.74rem]",
                    c.backStripClass,
                  )}
                >
                  {c.backCaption}
                </div>
              </div>
            </>
          )}

          {(c.variant === "arch" || c.variant === "door") && (
            <>
              <div
                className={cn(
                  "artify-hero-flip-face artify-hero-flip-face--front absolute inset-0 flex flex-col overflow-hidden border-[3px] border-ink bg-[#f4f2ea] shadow-[8px_8px_0_0_var(--color-ink)]",
                  r,
                )}
              >
                <div
                  className={cn(
                    "relative min-h-0 w-full flex-1 overflow-hidden border-b-[3px] border-ink bg-ink",
                    c.variant === "door"
                      ? "rounded-t-full"
                      : "rounded-t-[2.5rem]",
                  )}
                >
                  <ResponsiveImage
                    src={c.front.src}
                    alt={c.front.alt}
                    width={c.front.width}
                    height={c.front.height}
                    loading={c.loading}
                    decoding="async"
                    fetchPriority={c.fetchPriority}
                    sizes="(min-width: 1024px) 260px, 44vw"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </div>
                <div
                  className={cn(
                    "shrink-0 px-1.5 py-1 text-center text-[0.72rem] leading-snug sm:py-0.5 sm:text-[0.56rem] lg:text-[0.7rem] xl:text-[0.75rem]",
                    c.frontStripClass,
                  )}
                >
                  {c.frontCaption}
                </div>
              </div>
              <div
                className={cn(
                  "artify-hero-flip-face artify-hero-flip-face--back absolute inset-0 flex flex-col overflow-hidden border-[3px] border-ink bg-ink shadow-[8px_8px_0_0_var(--color-ink)]",
                  r,
                )}
              >
                <div
                  className={cn(
                    "relative min-h-0 w-full flex-1 overflow-hidden border-b-[3px] border-ink bg-ink",
                    c.variant === "door"
                      ? "rounded-t-full"
                      : "rounded-t-[2.5rem]",
                  )}
                >
                  <ResponsiveImage
                    src={c.back.src}
                    alt={c.back.alt}
                    width={c.back.width}
                    height={c.back.height}
                    loading={c.loading}
                    decoding="async"
                    sizes="(min-width: 1024px) 260px, 44vw"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                </div>
                <div
                  className={cn(
                    "shrink-0 px-1.5 py-1 text-center text-[0.7rem] leading-snug sm:py-0.5 sm:text-[0.56rem] lg:text-[0.68rem] xl:text-[0.74rem]",
                    c.backStripClass,
                  )}
                >
                  {c.backCaption}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type HeroPlayfulCollageProps = {
  collageCards?: ReadonlyArray<CollageCardOverride | null> | null;
  tinaSection?: any;
};

/** Shared hero collage (was HeroPlayfulCollage.astro). */
export default function HeroPlayfulCollage({
  collageCards,
  tinaSection,
}: HeroPlayfulCollageProps = {}) {
  const cards = useMemo(() => mergeCollageCards(collageCards), [collageCards]);

  useEffect(() => {
    let teardown: (() => void) | undefined;
    const run = (): void => {
      teardown?.();
      teardown = bindHeroEyes();
    };
    run();
    document.addEventListener("astro:page-load", run);
    return () => {
      document.removeEventListener("astro:page-load", run);
      teardown?.();
    };
  }, []);

  return (
    <div
      className="artify-hero-playful relative flex min-h-0 w-full min-w-0 max-lg:order-3 lg:min-h-0 lg:flex-1 lg:flex-col"
      aria-label="Collage of Artify programs and community"
    >
      <div
        className="artify-hero-scene-grid relative mx-auto min-h-[26.5rem] w-full flex-1 overflow-visible rounded-2xl border-[3px] border-ink p-4 shadow-[8px_8px_0_0_var(--color-ink)] sm:min-h-[31rem] sm:p-5 lg:h-full lg:min-h-0"
        data-tina-field={
          tinaSection
            ? tinaField(tinaSection, "hhfShowCollage")
            : undefined
        }
      >
        {/* Lottie disco ball replaces the static one (top-right). */}
        <div
          className="pointer-events-auto absolute right-0 top-0 z-[30] w-[5.5rem] aspect-square sm:w-[6.25rem] lg:w-[7.1rem] xl:w-[7.75rem]"
          style={{ animationDelay: "-1.4s" }}
          role="img"
          aria-label="Decorative disco ball"
        >
          <div className="h-full w-full">
            <canvas
              className="h-full w-full artify-hero-disco-lottie"
              data-dotlottie-src="/lottie/kiss-sparkles.lottie"
              data-dotlottie-autoplay="1"
              data-dotlottie-loop="1"
              aria-hidden
            />
          </div>
        </div>

        {/* Maker-esque sticker: bedazzled glue gun (animated). */}
        <div
          className="pointer-events-auto absolute bottom-[-0.65rem] left-[-0.45rem] z-[26] w-[5.15rem] aspect-square drop-shadow-[5px_5px_0_var(--color-ink)] sm:bottom-[-0.8rem] sm:left-[-0.6rem] sm:w-[5.8rem] lg:bottom-[-0.95rem] lg:left-[-0.75rem] lg:w-[6.7rem] xl:bottom-[-1.05rem] xl:left-[-0.85rem] xl:w-[7.3rem]"
          style={{ animationDelay: "-2.7s", transform: "rotate(-12deg)" }}
          role="img"
          aria-label="Decorative bedazzled glue gun"
        >
          <div className="h-full w-full">
            <canvas
              className="h-full w-full"
              data-dotlottie-src="/lottie/glue-gun.lottie"
              data-dotlottie-autoplay="1"
              data-dotlottie-loop="1"
              aria-hidden
            />
          </div>
        </div>

        {/* Bottom-right Lottie sticker (rotated). */}
        <div
          className="pointer-events-auto absolute bottom-[-0.9rem] right-[-0.9rem] z-[30] w-[5.5rem] aspect-square sm:bottom-[-1.15rem] sm:right-[-1.15rem] sm:w-[6.25rem] lg:bottom-[-1.35rem] lg:right-[-1.35rem] lg:w-[7.1rem] xl:bottom-[-1.5rem] xl:right-[-1.5rem] xl:w-[7.75rem]"
          data-dotlottie-rotate-wrapper
          role="img"
          aria-label="Decorative bottom-right lottie sticker"
        >
          <div className="h-full w-full">
            <canvas
              className="h-full w-full"
              data-dotlottie-src="/lottie/bottom-right.lottie"
              data-dotlottie-autoplay="1"
              data-dotlottie-loop="1"
              data-dotlottie-speed="0.75"
              data-dotlottie-mode="bounce"
              data-dotlottie-random-rotate="1"
              data-dotlottie-rotate-min="-15"
              data-dotlottie-rotate-max="45"
              aria-hidden
            />
          </div>
        </div>

        <div
          className="pointer-events-auto absolute left-0 top-0 z-[30] sm:left-0 sm:top-0"
          aria-hidden
        >
          <div
            className="relative inline-flex rotate-[-8deg] items-center gap-2.5 rounded-full border-[3px] border-ink bg-white px-3.5 py-2 shadow-[4px_4px_0_0_var(--color-ink)]"
            data-artify-hero-eyes
          >
            <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-mist">
              <span className="artify-hero-pupil pointer-events-none absolute left-1/2 top-1/2 z-[1] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
              <span
                className="artify-hero-eye-lid pointer-events-none absolute bottom-0 left-1/2 z-[2] h-[20%] w-[118%] -translate-x-1/2 rounded-t-[9999px] border-x-2 border-b-2 border-ink"
                aria-hidden
              >
                <svg
                  className="pointer-events-none absolute left-1/2 top-0 w-[125%] max-w-none -translate-x-1/2 -translate-y-[15%] text-ink"
                  viewBox="0 0 36 9"
                  fill="none"
                  aria-hidden
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M5 2v4.5M11 1.5l-.5 5M17 2v5M23 1.5l.5 5M29 2v4.5"
                  />
                </svg>
              </span>
              <span
                className="artify-hero-eye-lid artify-hero-eye-shutter artify-hero-eye-shutter--blink pointer-events-none absolute inset-0 z-[4] origin-top"
                aria-hidden
              >
                <svg
                  className="pointer-events-none absolute bottom-0 left-1/2 w-[135%] max-w-none -translate-x-1/2 text-ink"
                  viewBox="0 0 36 11"
                  fill="none"
                  aria-hidden
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M2 10l1-5.5M7 10V4M12 10l1-6M18 10V3.5M24 10l-1-6M29 10V4M34 10l-1-5.5"
                  />
                </svg>
              </span>
            </span>
            <span className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-mist">
              <span className="artify-hero-pupil pointer-events-none absolute left-1/2 top-1/2 z-[1] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink" />
              <span
                className="artify-hero-eye-lid pointer-events-none absolute bottom-0 left-1/2 z-[2] h-[20%] w-[118%] -translate-x-1/2 rounded-t-[9999px] border-x-2 border-b-2 border-ink"
                aria-hidden
              >
                <svg
                  className="pointer-events-none absolute left-1/2 top-0 w-[125%] max-w-none -translate-x-1/2 -translate-y-[15%] text-ink"
                  viewBox="0 0 36 9"
                  fill="none"
                  aria-hidden
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M5 2v4.5M11 1.5l-.5 5M17 2v5M23 1.5l.5 5M29 2v4.5"
                  />
                </svg>
              </span>
              <span
                className="artify-hero-eye-lid artify-hero-eye-shutter artify-hero-eye-shutter--blink pointer-events-none absolute inset-0 z-[4] origin-top"
                aria-hidden
              >
                <svg
                  className="pointer-events-none absolute bottom-0 left-1/2 w-[135%] max-w-none -translate-x-1/2 text-ink"
                  viewBox="0 0 36 11"
                  fill="none"
                  aria-hidden
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M2 10l1-5.5M7 10V4M12 10l1-6M18 10V3.5M24 10l-1-6M29 10V4M34 10l-1-5.5"
                  />
                </svg>
              </span>
            </span>

            {/* Decorative lipstick lips (playful collage "eyes" character). */}
            <span
              className="artify-hero-lips pointer-events-none absolute left-1/2 top-full z-[3] -translate-x-1/2 -translate-y-[30%]"
              aria-hidden
            >
              {/* Sparkle burst inspired by Lottie (emulated; one-shot on hover). */}
              <span className="artify-hero-kiss-sparkles pointer-events-none absolute left-1/2 top-1/2">
                <span className="artify-hero-kiss-sparkle artify-hero-kiss-sparkle--a" />
                <span className="artify-hero-kiss-sparkle artify-hero-kiss-sparkle--b" />
                <span className="artify-hero-kiss-sparkle artify-hero-kiss-sparkle--c" />
                <span className="artify-hero-kiss-sparkle artify-hero-kiss-sparkle--d" />
                <span className="artify-hero-kiss-sparkle artify-hero-kiss-sparkle--e" />
                <span className="artify-hero-kiss-sparkle artify-hero-kiss-sparkle--f" />
              </span>
              <span className="artify-hero-lips-inner pointer-events-none relative block">
                <span className="artify-hero-kiss-heart pointer-events-none absolute left-1/2 top-1/2">
                  <svg
                    viewBox="0 0 24 24"
                    width="16"
                    height="16"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12 21s-7.3-4.5-9.8-8.5C.2 9 2.3 5.8 5.7 5.4c1.9-.2 3.5.7 4.5 2 1-1.3 2.6-2.2 4.5-2 3.4.4 5.5 3.6 3.5 7.1C19.3 16.5 12 21 12 21Z"
                      fill="var(--color-kiss-heart)"
                    />
                  </svg>
                </span>
                <svg
                  width="28"
                  height="14"
                  viewBox="0 0 56 28"
                  fill="none"
                  className="drop-shadow-[2px_2px_0_var(--color-ink)]"
                  aria-hidden
                >
                  <path
                    d="M6 14c6.5-7.8 14.6-11.5 22-11.5S43.5 6.2 50 14c-6.5 8.2-14.6 12-22 12S12.5 22.2 6 14Z"
                    fill="var(--color-accent-soft)"
                    stroke="var(--color-ink)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16.5 14c3.4 2.8 7.2 4.2 11.5 4.2S36.1 16.8 39.5 14"
                    stroke="var(--color-ink)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M28 2.6c-4.2 0-7.3 2.2-9.3 5.2M28 2.6c4.2 0 7.3 2.2 9.3 5.2"
                    stroke="rgba(255,255,255,0.65)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </span>
          </div>
        </div>

        {cards.map((c) => (
          <article
            key={`${c.box}-${c.front.src}`}
            className={cn(
              "pointer-events-none absolute z-[22] origin-center",
              c.flip === "artify-hero-flip-a"
                ? "artify-hero-stack-a"
                : c.flip === "artify-hero-flip-b"
                  ? "artify-hero-stack-b"
                  : c.flip === "artify-hero-flip-c"
                    ? "artify-hero-stack-c"
                    : "artify-hero-stack-d",
              c.box,
            )}
            style={{ animationDelay: `-${c.layerDelaySec}s` }}
          >
            <div
              className={cn("origin-center", c.bob)}
              style={{ animationDelay: `-${c.layerDelaySec}s` }}
            >
              <CardFaces c={c} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

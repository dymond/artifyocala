import { useEffect, useMemo } from "react";
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
  const root = document.querySelector("[data-artify-hero-eyes]");
  if (!root) return () => {};

  const pupils = root.querySelectorAll<HTMLElement>(".artify-hero-pupil");
  if (pupils.length === 0) return () => {};

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

  return () => {
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("blur", reset);
    root.removeEventListener("pointerleave", reset);
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
                    "shrink-0 border-t-[3px] border-ink px-1.5 py-[0.2rem] text-center text-[0.56rem] leading-tight sm:py-0.5 sm:text-[0.58rem]",
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
                    "shrink-0 border-t-[3px] border-ink px-1.5 py-[0.2rem] text-center text-[0.54rem] leading-tight sm:py-0.5 sm:text-[0.56rem]",
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
                    "shrink-0 px-1.5 py-[0.2rem] text-center leading-tight sm:py-0.5",
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
                    "shrink-0 px-1.5 py-[0.2rem] text-center text-[0.54rem] leading-tight sm:py-0.5 sm:text-[0.56rem]",
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
};

/** Shared hero collage (was HeroPlayfulCollage.astro). */
export default function HeroPlayfulCollage({
  collageCards,
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
      <div className="artify-hero-scene-grid relative mx-auto min-h-[26.5rem] w-full flex-1 overflow-visible rounded-2xl border-[3px] border-ink p-4 shadow-[8px_8px_0_0_var(--color-ink)] sm:min-h-[31rem] sm:p-5 lg:h-full lg:min-h-0">
        <div
          className="pointer-events-none absolute bottom-[34%] left-[38%] w-[3.35rem] sm:bottom-[32%] sm:left-[40%] sm:w-[3.85rem]"
          style={{ animationDelay: "-2.7s" }}
          aria-hidden
        >
          <svg
            className="artify-hero-goofy-wobble h-full w-full drop-shadow-[2px_2px_0_var(--color-ink)]"
            viewBox="0 0 40 40"
            fill="none"
            role="img"
          >
            <title>Decorative smiley face</title>
            <circle
              cx="20"
              cy="20"
              r="17.5"
              fill="var(--color-mist)"
              stroke="var(--color-ink)"
              strokeWidth="2.5"
            />
            <circle cx="13" cy="17" r="2.8" fill="var(--color-ink)" />
            <circle cx="27" cy="17" r="2.8" fill="var(--color-ink)" />
            <path
              d="M11 25q9 10 18 0"
              stroke="var(--color-ink)"
              strokeWidth="2.75"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        <div
          className="pointer-events-auto absolute left-[46%] top-[8%] z-[25] -translate-x-1/2 sm:left-[48%] sm:top-[10%]"
          aria-hidden
        >
          <div
            className="inline-flex rotate-[-8deg] items-center gap-2.5 rounded-full border-[3px] border-ink bg-white px-3.5 py-2 shadow-[4px_4px_0_0_var(--color-ink)]"
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
                className="artify-hero-eye-lid artify-hero-eye-shutter artify-hero-eye-shutter--blink artify-hero-eye-shutter--blink-delay pointer-events-none absolute inset-0 z-[4] origin-top"
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
          </div>
        </div>

        {cards.map((c) => (
          <article
            key={`${c.box}-${c.front.src}`}
            className={cn(
              "pointer-events-none absolute z-[22] origin-center",
              c.bob,
              c.box,
            )}
            style={{ animationDelay: `-${c.layerDelaySec}s` }}
          >
            <CardFaces c={c} />
          </article>
        ))}
      </div>
    </div>
  );
}

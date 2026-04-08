import { useEffect, useMemo } from "react";
import {
  destroyGalleryMarqueeDesktop,
  mountGalleryMarqueeDesktop,
} from "../../scripts/gallery-marquee-desktop";
import ResponsiveImage from "../ui/ResponsiveImage";

export type GalleryMarqueeSlide = {
  src: string;
  alt: string;
};

type Props = {
  slides: readonly GalleryMarqueeSlide[];
  surface?: "dark" | "light";
  "data-testid"?: string;
  className?: string;
};

const cellLight =
  "gallery-marquee-item pointer-events-auto relative m-0 h-[clamp(220px,36vh,300px)] w-[clamp(10.5rem,22vw,13.75rem)] shrink-0 [transform-style:preserve-3d] overflow-hidden rounded-xl border border-line/70 bg-ink/[0.03] shadow-none transition-[transform,box-shadow] duration-[1350ms] ease-[cubic-bezier(0.19,1,0.22,1)] motion-safe:[transform:translateZ(0)] motion-safe:hover:z-30 motion-safe:hover:[transform:translateY(-0.5rem)_translateZ(2.25rem)_rotateX(7deg)_rotateY(-6deg)_scale(1.05)] motion-safe:hover:shadow-[0_32px_64px_-12px_rgba(28,28,51,0.42),0_16px_32px_-10px_rgba(28,28,51,0.22)]";

const cellDark =
  "gallery-marquee-item pointer-events-auto relative m-0 h-[clamp(220px,36vh,300px)] w-[clamp(10.5rem,22vw,13.75rem)] shrink-0 [transform-style:preserve-3d] overflow-hidden rounded-xl border border-white/12 bg-black/25 shadow-none transition-[transform,box-shadow] duration-[1350ms] ease-[cubic-bezier(0.19,1,0.22,1)] motion-safe:[transform:translateZ(0)] motion-safe:hover:z-30 motion-safe:hover:[transform:translateY(-0.5rem)_translateZ(2.25rem)_rotateX(7deg)_rotateY(-6deg)_scale(1.05)] motion-safe:hover:shadow-[0_36px_72px_-14px_rgba(0,0,0,0.78),0_18px_36px_-12px_rgba(0,0,0,0.48)]";

const imgClass = "h-full w-full object-cover";
const viewportClass = "gallery-marquee-viewport";
const trackClipClass = "gallery-marquee-track-clip";

export default function GalleryMarqueeIsland({
  slides,
  surface = "dark",
  "data-testid": dataTestId,
  className = "",
}: Props) {
  const cellClass = surface === "light" ? cellLight : cellDark;
  const desktopSplitCapable = slides.length >= 4;
  const mid = Math.ceil(slides.length / 2);
  const rowA = slides.slice(0, mid);
  const rowB = slides.slice(mid);

  const slideKey = useMemo(
    () => slides.map((s) => s.src).join("|"),
    [slides],
  );

  useEffect(() => {
    if (!desktopSplitCapable) return;
    mountGalleryMarqueeDesktop();
    return () => destroyGalleryMarqueeDesktop();
  }, [desktopSplitCapable, slideKey]);

  const shellClass =
    surface === "light"
      ? "[--gallery-marquee-edge:var(--color-mist)]"
      : "[--gallery-marquee-edge:var(--color-void)]";

  return (
    <div
      className={`gallery-marquee-shell w-full min-w-0 ${shellClass} ${className}`}
      data-gallery-marquee-shell
      {...(desktopSplitCapable ? { "data-desktop-split-capable": "true" } : {})}
      data-testid={dataTestId}
    >
      {desktopSplitCapable ? (
        <>
          <div className="lg:hidden">
            <div className={viewportClass}>
              <div className={trackClipClass}>
                <div className="artify-marquee-track artify-marquee-track--gallery">
                  <div className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]">
                    {slides.map((s, i) => (
                      <figure key={`m-${s.src}-${i}`} className={cellClass}>
                        <ResponsiveImage
                          src={s.src}
                          alt={s.alt}
                          className={imgClass}
                          loading="lazy"
                          decoding="async"
                          sizes="min(44vw, 14rem)"
                        />
                      </figure>
                    ))}
                  </div>
                  <div
                    className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]"
                    aria-hidden="true"
                  >
                    {slides.map((s) => (
                      <figure key={`m-dup-${s.src}`} className={cellClass}>
                        <ResponsiveImage
                          src={s.src}
                          alt=""
                          className={imgClass}
                          loading="lazy"
                          decoding="async"
                          sizes="min(44vw, 14rem)"
                        />
                      </figure>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="hidden min-w-0 w-full lg:block"
            data-gallery-marquee-desktop-root
          >
            <div className="gallery-marquee-dsk-single">
              <div className={viewportClass}>
                <div className={trackClipClass}>
                  <div className="artify-marquee-track artify-marquee-track--gallery">
                    <div className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]">
                      {slides.map((s, i) => (
                        <figure key={`d-${s.src}-${i}`} className={cellClass}>
                          <ResponsiveImage
                            src={s.src}
                            alt={s.alt}
                            className={imgClass}
                            loading="lazy"
                            decoding="async"
                            sizes="min(22vw, 14rem)"
                          />
                        </figure>
                      ))}
                    </div>
                    <div
                      className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]"
                      aria-hidden="true"
                    >
                      {slides.map((s) => (
                        <figure key={`d-dup-${s.src}`} className={cellClass}>
                          <ResponsiveImage
                            src={s.src}
                            alt=""
                            className={imgClass}
                            loading="lazy"
                            decoding="async"
                            sizes="min(22vw, 14rem)"
                          />
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="gallery-marquee-dsk-dual hidden flex flex-col gap-[var(--spacing-md)] overflow-visible">
              <div className={viewportClass}>
                <div className={trackClipClass}>
                  <div
                    className="artify-marquee-track artify-marquee-track--gallery"
                    data-marquee-row="a"
                  >
                    <div className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]">
                      {rowA.map((s, i) => (
                        <figure key={`a-${s.src}-${i}`} className={cellClass}>
                          <ResponsiveImage
                            src={s.src}
                            alt={s.alt}
                            className={imgClass}
                            loading="lazy"
                            decoding="async"
                            sizes="min(22vw, 14rem)"
                          />
                        </figure>
                      ))}
                    </div>
                    <div
                      className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]"
                      aria-hidden="true"
                    >
                      {rowA.map((s) => (
                        <figure key={`a-dup-${s.src}`} className={cellClass}>
                          <ResponsiveImage
                            src={s.src}
                            alt=""
                            className={imgClass}
                            loading="lazy"
                            decoding="async"
                            sizes="min(22vw, 14rem)"
                          />
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className={viewportClass}>
                <div className={trackClipClass}>
                  <div
                    className="artify-marquee-track artify-marquee-track--gallery-reverse"
                    data-marquee-row="b"
                  >
                    <div className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]">
                      {rowB.map((s, i) => (
                        <figure key={`b-${s.src}-${i}`} className={cellClass}>
                          <ResponsiveImage
                            src={s.src}
                            alt={s.alt}
                            className={imgClass}
                            loading="lazy"
                            decoding="async"
                            sizes="min(22vw, 14rem)"
                          />
                        </figure>
                      ))}
                    </div>
                    <div
                      className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]"
                      aria-hidden="true"
                    >
                      {rowB.map((s) => (
                        <figure key={`b-dup-${s.src}`} className={cellClass}>
                          <ResponsiveImage
                            src={s.src}
                            alt=""
                            className={imgClass}
                            loading="lazy"
                            decoding="async"
                            sizes="min(22vw, 14rem)"
                          />
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className={viewportClass}>
          <div className={trackClipClass}>
            <div className="artify-marquee-track artify-marquee-track--gallery">
              <div className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]">
                {slides.map((s, i) => (
                  <figure key={`s-${s.src}-${i}`} className={cellClass}>
                    <ResponsiveImage
                      src={s.src}
                      alt={s.alt}
                      className={imgClass}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 1024px) min(22vw, 14rem), min(44vw, 14rem)"
                    />
                  </figure>
                ))}
              </div>
              <div
                className="pointer-events-none flex shrink-0 items-center gap-[var(--spacing-md)] pr-[var(--spacing-md)]"
                aria-hidden="true"
              >
                {slides.map((s) => (
                  <figure key={`s-dup-${s.src}`} className={cellClass}>
                    <ResponsiveImage
                      src={s.src}
                      alt=""
                      className={imgClass}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 1024px) min(22vw, 14rem), min(44vw, 14rem)"
                    />
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

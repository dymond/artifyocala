import type { CSSProperties } from "react";
import { tinaField } from "tinacms/dist/react";
import { btnClassForTone } from "../../lib/tina-button-tone";
import { imageAlt } from "../../lib/image-alt";
import { COLORS_DARK } from "../../lib/who-arch-backdrop-palette";
import { normalizeTinaRepoMediaSrc } from "../../lib/tina-media";

function IconExt() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 opacity-95"
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

/** CMS + Tina; matches `whoScroll` in page JSON and GraphQL. */
export type WhoScrollSectionFields = {
  wscImage: string;
  wscImageAlt: string;
  wscEyebrow: string;
  wscHeading: string;
  wscLedeHtml: string;
  wscButtonLabel: string;
  wscButtonHref: string;
  wscButtonExternal?: boolean | null;
  wscButtonTone?: string | null;
};

type Props = { section: WhoScrollSectionFields };

export default function WhoScrollArchVisual({ section }: Props) {
  const s = section;
  const tone = s.wscButtonTone ?? "surge";

  return (
    <section
      id="who"
      className="artify-canvas overflow-x-clip"
      aria-labelledby="who-heading"
    >
      <div className="artify-who-driver min-h-[280vh] w-full max-w-none">
        <div
          className="artify-who-sticky sticky top-0 z-0 flex h-dvh min-h-[26rem] w-full items-end justify-center overflow-hidden bg-mist dark:bg-[color:var(--artify-who-backdrop-surface)]"
          style={
            { "--artify-who-backdrop-surface": COLORS_DARK.base } as CSSProperties
          }
        >
          <div
            className="artify-who-webgl-wrap pointer-events-none absolute inset-0 z-[1] opacity-[0.92] dark:opacity-100"
            aria-hidden
          >
            <canvas
              id="artify-who-canvas"
              className="min-h-0 min-w-0 bg-mist dark:bg-[color:var(--artify-who-backdrop-surface)]"
            />
          </div>
          <div className="artify-who-arch-frame relative z-[2] bg-ink">
            <img
              src={normalizeTinaRepoMediaSrc(s.wscImage)}
              alt={imageAlt(s.wscImageAlt, `${s.wscHeading} — background`)}
              width={1317}
              height={1756}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 z-0 h-full max-h-none w-full object-cover object-[center_30%]"
              data-tina-field={tinaField(s, "wscImage")}
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-ink/52 via-ink/26 via-35% to-ink/86"
              aria-hidden
            />
            <div
              className="artify-who-readability-vignette pointer-events-none absolute inset-0 z-[1]"
              aria-hidden
            />
            <div
              className="artify-who-arch-depth pointer-events-none absolute inset-0 z-[1]"
              aria-hidden
            />
            <div className="artify-who-copy-layer dark-surface absolute inset-0 z-[2] flex flex-col items-center justify-center gap-0 py-xl text-center">
              <div className="artify-who-copy-inner flex shrink-0 flex-col items-center px-[max(var(--spacing-md),env(safe-area-inset-left))] sm:px-lg">
                <p
                  className="mb-2 font-display text-[0.82rem] font-extrabold uppercase tracking-[0.24em] text-accent-soft"
                  data-tina-field={tinaField(s, "wscEyebrow")}
                >
                  {s.wscEyebrow}
                </p>
                <h2
                  id="who-heading"
                  className="mb-sm font-display text-[clamp(2rem,4.5vw,3.35rem)] font-bold leading-[1.06] tracking-[-0.02em] text-mist"
                  data-tina-field={tinaField(s, "wscHeading")}
                >
                  {s.wscHeading}
                </h2>
                <div
                  className="artify-rte artify-who-lede mb-lg max-w-none text-balance text-[1.22rem] font-medium leading-[1.62] text-mist sm:text-[1.32rem] md:text-[1.38rem] [&_a]:font-medium [&_a]:text-accent-soft [&_a]:no-underline hover:[&_a]:underline"
                  data-tina-field={tinaField(s, "wscLedeHtml")}
                  dangerouslySetInnerHTML={{ __html: s.wscLedeHtml }}
                />
                <div>
                  <a
                    href={s.wscButtonHref}
                    className={btnClassForTone(tone)}
                    target={s.wscButtonExternal ? "_blank" : undefined}
                    rel={
                      s.wscButtonExternal ? "noopener noreferrer" : undefined
                    }
                    data-tina-field={tinaField(s, "wscButtonLabel")}
                  >
                    {s.wscButtonExternal ? <IconExt /> : null}
                    {s.wscButtonLabel}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

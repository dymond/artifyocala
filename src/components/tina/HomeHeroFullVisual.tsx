import { tinaField } from "tinacms/dist/react";
import type { PageSectionsHomeHeroFull } from "../../../tina/__generated__/types";
import { img } from "../../lib/site-images";
import { imageAlt } from "../../lib/image-alt";
import { btnClassForTone } from "../../lib/tina-button-tone";
import HeroPlayfulCollage from "./HeroPlayfulCollage";
import WordRotator from "./WordRotator";
import ResponsiveImage from "../ui/ResponsiveImage";

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

type Props = { section: PageSectionsHomeHeroFull };

export default function HomeHeroFullVisual({ section }: Props) {
  const s = section;
  const words = (s.hhfRotatorWords ?? []).filter(Boolean) as string[];
  const showCollage = s.hhfShowCollage !== false;
  const heroButtons = (s.hhfHeroButtons ?? []).filter(Boolean);
  const asideStack = (s.hhfAsideStackButtons ?? []).filter(Boolean);

  return (
    <section className="bg-[linear-gradient(165deg,#e8ebfa_0%,var(--color-mist)_40%,#dde2f8_100%)] pb-2xl pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
      <div className="site-container">
        <div className="flex flex-col gap-y-xl lg:flex-row lg:items-stretch lg:gap-x-xl lg:gap-y-0">
          <div className="contents lg:flex lg:min-h-0 lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-y-xl">
            <div className="flex min-w-0 flex-col gap-y-5 max-lg:order-1 md:gap-y-6 lg:min-w-0">
              <a
                href="/"
                className="group relative z-[1] block w-[min(44vw,9.75rem)] max-w-full shrink-0 self-start outline-none transition-opacity duration-200 hover:opacity-[0.88] focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-mist sm:w-[10.25rem] md:w-[11rem] lg:-mb-1 lg:w-[11.25rem]"
                aria-label="Artify Ocala — Home"
              >
                <ResponsiveImage
                  src={img.logoOnLightHollow}
                  alt=""
                  width={1600}
                  height={1260}
                  decoding="async"
                  fetchPriority="high"
                  sizes="(max-width: 1023px) min(44vw, 12rem), 11.25rem"
                  className="h-auto w-full object-contain object-left"
                />
              </a>
              <div>
                <p
                  className="type-section-yell"
                  data-tina-field={tinaField(s, "hhfEyebrow")}
                >
                  {s.hhfEyebrow}
                </p>
                <h1
                  className="type-display-xl"
                  data-tina-field={tinaField(s, "hhfTitle")}
                >
                  {s.hhfTitle}
                </h1>
                {words.length > 0 ? (
                  <p
                    className="mb-md uppercase leading-none"
                    data-tina-field={tinaField(s, "hhfRotatorWords")}
                  >
                    <WordRotator
                      className="artify-hero-word-rotator"
                      words={words}
                    />
                  </p>
                ) : null}
                <p
                  className="type-lede"
                  data-tina-field={tinaField(s, "hhfLede")}
                >
                  {s.hhfLede}
                </p>
                {heroButtons.length > 0 ? (
                  <div className="flex flex-wrap gap-sm">
                    {heroButtons.map((b, i) =>
                      b ? (
                        <a
                          key={`${b.hhbHref}-${i}`}
                          href={b.hhbHref}
                          className={btnClassForTone(b.hhbTone ?? "primary")}
                          target={b.hhbExternal ? "_blank" : undefined}
                          rel={
                            b.hhbExternal ? "noopener noreferrer" : undefined
                          }
                          data-tina-field={tinaField(b, "hhbLabel")}
                        >
                          {b.hhbExternal ? <IconExt /> : null}
                          {b.hhbLabel}
                        </a>
                      ) : null
                    )}
                  </div>
                ) : null}
              </div>
            </div>
            {showCollage ? (
              <div className="max-lg:contents lg:flex lg:min-h-0 lg:min-w-0 lg:flex-1 lg:flex-col">
                <HeroPlayfulCollage />
              </div>
            ) : null}
          </div>
          <div className="contents lg:flex lg:min-w-0 lg:flex-1 lg:flex-col lg:gap-y-xl">
            <aside className="min-w-0 max-lg:order-2 rotate-[-0.35deg] rounded-xl border-[3px] border-ink bg-mist p-lg shadow-[10px_10px_0_0_var(--color-buzz)] lg:min-w-0">
              <div className="mb-md flex flex-col gap-sm sm:flex-row sm:items-start sm:justify-between sm:gap-md">
                <div className="min-w-0 flex-1">
                  <p
                    className="mb-sm inline-block rounded border-2 border-surge bg-surge/10 px-2 py-1 font-display text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-surge"
                    data-tina-field={tinaField(s, "hhfAsideBadge")}
                  >
                    {s.hhfAsideBadge}
                  </p>
                  <h2
                    className="font-display text-[1.75rem] font-bold leading-tight tracking-tight"
                    data-tina-field={tinaField(s, "hhfAsideTitle")}
                  >
                    {s.hhfAsideTitle}
                  </h2>
                  <p
                    className="type-muted mb-0 mt-0"
                    data-tina-field={tinaField(s, "hhfAsideDescription")}
                  >
                    {s.hhfAsideDescription}
                  </p>
                </div>
                <a
                  href={s.hhfAsideMeetupsHref}
                  className={`${btnClassForTone(
                    s.hhfAsideMeetupsTone ?? "outline"
                  )} w-full shrink-0 sm:mt-1 sm:w-auto sm:self-start`}
                  target={s.hhfAsideMeetupsExternal ? "_blank" : undefined}
                  rel={
                    s.hhfAsideMeetupsExternal
                      ? "noopener noreferrer"
                      : undefined
                  }
                  data-tina-field={tinaField(s, "hhfAsideMeetupsLabel")}
                >
                  {s.hhfAsideMeetupsExternal ? <IconExt /> : null}
                  {s.hhfAsideMeetupsLabel}
                </a>
              </div>
              {asideStack.length > 0 ? (
                <div className="flex flex-col gap-sm">
                  {asideStack.map((b, i) =>
                    b ? (
                      <a
                        key={`${b.habsHref}-${i}`}
                        href={b.habsHref}
                        className={btnClassForTone(b.habsTone ?? "primary")}
                        target={b.habsExternal ? "_blank" : undefined}
                        rel={b.habsExternal ? "noopener noreferrer" : undefined}
                        data-tina-field={tinaField(b, "habsLabel")}
                      >
                        {b.habsExternal ? <IconExt /> : null}
                        {b.habsLabel}
                      </a>
                    ) : null
                  )}
                </div>
              ) : null}
            </aside>
            <ResponsiveImage
              src={s.hhfHiringImage ?? ""}
              alt={imageAlt(
                s.hhfHiringImageAlt,
                `${s.hhfAsideTitle} — community photo`,
              )}
              width={1080}
              height={1350}
              loading="eager"
              decoding="async"
              sizes="(min-width: 1024px) min(520px, 42vw), 92vw"
              className="h-auto w-full min-w-0 max-lg:order-4 -rotate-[0.5deg] rounded-xl border-[3px] border-ink object-contain shadow-[6px_6px_0_0_var(--color-surge)] transition-transform duration-300 hover:rotate-0 lg:min-w-0"
              data-tina-field={tinaField(s, "hhfHiringImage")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

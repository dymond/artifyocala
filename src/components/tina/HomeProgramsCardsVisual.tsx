import { tinaField } from "tinacms/dist/react";
import type { PageSectionsHomeProgramsIntro } from "../../../tina/__generated__/types";
import { cn } from "../../lib/cn";
import { imageAlt } from "../../lib/image-alt";
import { btnClassForTone } from "../../lib/tina-button-tone";
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

const themeClass: Record<string, string> = {
  buzz: "border-buzz/55 shadow-[8px_8px_0_0_rgba(176,184,255,0.28)]",
  club: "border-club/50 shadow-[8px_8px_0_0_rgba(165,158,255,0.3)]",
  surge: "border-surge/45 shadow-[8px_8px_0_0_rgba(107,100,201,0.28)]",
};

type Props = { section: PageSectionsHomeProgramsIntro };

export default function HomeProgramsCardsVisual({ section }: Props) {
  const s = section;
  const cards = (s.hpiCards ?? []).filter(Boolean);

  return (
    <section className="dark-surface bg-void py-2xl text-mist" id="programs">
      <div className="site-container">
        <p
          className="mb-0 text-buzz font-display text-[0.7rem] font-extrabold uppercase tracking-[0.28em]"
          data-tina-field={tinaField(s, "hpiEyebrow")}
        >
          {s.hpiEyebrow}
        </p>
        <h2
          className="type-display-lg"
          data-tina-field={tinaField(s, "hpiHeading")}
        >
          {s.hpiHeading}
        </h2>
        <p
          className="type-lede text-mist/70"
          data-tina-field={tinaField(s, "hpiLedeHtml")}
          dangerouslySetInnerHTML={{ __html: s.hpiLedeHtml }}
        />
        <div className="artify-program-card-grid mt-lg grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-lg md:gap-xl [perspective:1200px]">
          {cards.map((card, ci) =>
            card ? (
              <article
                key={`${card.hpiCardTitle}-${ci}`}
                data-artify-program-tilt
                data-tilt-base-z={card.hpiCardTiltBaseZ ?? "0"}
                data-tilt-theme={card.hpiCardTheme ?? "buzz"}
                className={cn(
                  "artify-program-card-tilt flex min-h-[18rem] flex-col overflow-hidden rounded-xl border-[3px] bg-panel p-0 transform-gpu transition-[box-shadow] duration-300 ease-out [transform-style:preserve-3d] will-change-transform",
                  themeClass[card.hpiCardTheme ?? "buzz"] ?? themeClass.buzz
                )}
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <ResponsiveImage
                    src={card.hpiCardImage}
                    alt={imageAlt(
                      card.hpiCardImageAlt,
                      `${card.hpiCardTitle} — photo`,
                    )}
                    width={1125}
                    height={1138}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 30vw, 92vw"
                    className="h-full w-full object-cover"
                    data-tina-field={tinaField(card, "hpiCardImage")}
                  />
                </div>
                <h3
                  className="mx-lg mb-sm mt-md font-display text-xl"
                  data-tina-field={tinaField(card, "hpiCardTitle")}
                >
                  {card.hpiCardTitle}
                </h3>
                <div
                  className="mx-lg mb-md text-[0.98rem] text-mist/80 [&_strong]:font-semibold"
                  data-tina-field={tinaField(card, "hpiCardBodyHtml")}
                  dangerouslySetInnerHTML={{ __html: card.hpiCardBodyHtml }}
                />
                <div className="mx-lg mb-lg mt-auto flex flex-col gap-sm">
                  {(card.hpiCardButtons ?? []).map((btn, bi) =>
                    btn ? (
                      <a
                        key={`${btn.hpcbHref}-${bi}`}
                        href={btn.hpcbHref}
                        className={btnClassForTone(btn.hpcbTone ?? "primary")}
                        target={btn.hpcbExternal ? "_blank" : undefined}
                        rel={
                          btn.hpcbExternal ? "noopener noreferrer" : undefined
                        }
                        data-tina-field={tinaField(btn, "hpcbLabel")}
                      >
                        {btn.hpcbExternal ? <IconExt /> : null}
                        {btn.hpcbLabel}
                      </a>
                    ) : null
                  )}
                </div>
              </article>
            ) : null
          )}
        </div>
      </div>
    </section>
  );
}

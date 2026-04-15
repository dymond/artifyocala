import type React from "react";
import type { PageQuery } from "../../../tina/__generated__/types";

import { cn } from "../../lib/cn";
import { imageAlt } from "../../lib/image-alt";
import { btnClassForTone } from "../../lib/tina-button-tone";
import { btnOutline } from "../../lib/tina-ui-buttons";
import ResponsiveImage from "../ui/ResponsiveImage";
import HomeHeroFullVisual from "./HomeHeroFullVisual";
import HomeProgramsCardsVisual from "./HomeProgramsCardsVisual";
import MarqueeStripVisual from "./MarqueeStripVisual";
import WhoScrollArchVisual from "./WhoScrollArchVisual";

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

function SectionWrap({
  variant = "light",
  id,
  children,
}: {
  variant?: "light" | "dark";
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "py-2xl",
        variant === "dark"
          ? "dark-surface bg-void text-mist"
          : "bg-mist text-ink"
      )}
    >
      <div className="site-container">{children}</div>
    </section>
  );
}

type PageSectionItem = NonNullable<
  NonNullable<NonNullable<PageQuery["page"]>["sections"]>[number]
>;

function PageSectionView({ section }: { section: PageSectionItem }) {
  if (!section) return null;

  switch (section.__typename) {
    case "PageSectionsPageIntro": {
      const s = section;
      const src = s.introImage?.trim();
      return (
        <SectionWrap>
          <div className="grid grid-cols-1 items-start gap-xl lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-2xl">
            <div className="min-w-0">
              <h1 className="type-display-xl">{s.introTitle}</h1>
              {s.introLede ? <p className="type-lede">{s.introLede}</p> : null}
            </div>
            {src ? (
              <figure className="m-0 max-w-full overflow-hidden rounded-lg border border-line lg:sticky lg:top-6">
                <ResponsiveImage
                  src={src}
                  alt={imageAlt(s.introImageAlt, `${s.introTitle} — photo`)}
                  width={748}
                  height={880}
                  loading="eager"
                  decoding="async"
                  sizes="(min-width: 1024px) 22rem, 92vw"
                  className="block w-full max-h-[26rem] object-cover"
                />
              </figure>
            ) : null}
          </div>
        </SectionWrap>
      );
    }
    case "PageSectionsProseBand": {
      const s = section;
      const variant = s.pbVariant === "dark" ? "dark" : "light";
      const imgSrc = s.pbTopImage?.trim();
      return (
        <SectionWrap variant={variant === "dark" ? "dark" : "light"}>
          <div className="grid grid-cols-1 items-start gap-xl lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-x-2xl">
            <div className="min-w-0">
              {s.pbHeading ? (
                <h2 className="type-display-lg">{s.pbHeading}</h2>
              ) : null}
              {s.pbBodyHtml ? (
                <div
                  className="prose-inner max-w-[48rem] [&_p]:mb-md [&_strong]:font-semibold [&_a]:font-medium [&_a]:text-accent-soft [&_a]:no-underline hover:[&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: s.pbBodyHtml }}
                />
              ) : null}
            </div>
            {imgSrc ? (
              <div className="min-w-0 lg:sticky lg:top-6">
                <ResponsiveImage
                  src={imgSrc}
                  alt={imageAlt(
                    s.pbTopImageAlt,
                    s.pbHeading ? `${s.pbHeading} — image` : "Illustration"
                  )}
                  width={1317}
                  height={1756}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 1024px) 22rem, 92vw"
                  className={cn(
                    "w-full max-h-[26rem] rounded-lg border object-cover",
                    variant === "dark" ? "border-white/[0.12]" : "border-line"
                  )}
                />
              </div>
            ) : null}
          </div>
        </SectionWrap>
      );
    }
    case "PageSectionsMissionQuote": {
      const s = section;
      return (
        <SectionWrap>
          <h2 className="type-display-lg">Our mission</h2>
          {s.mqQuoteText ? (
            <blockquote className="m-0 rounded-r-lg border-l-4 border-accent bg-accent/[0.08] p-lg text-[1.1rem] italic leading-relaxed">
              {s.mqQuoteText}
            </blockquote>
          ) : null}
        </SectionWrap>
      );
    }
    case "PageSectionsObjectivesList": {
      const s = section;
      const lines = (s.objLines ?? []).filter(Boolean);
      const ctas = (s.objCtas ?? []).filter(Boolean);
      return (
        <SectionWrap>
          {s.objHeading ? (
            <h3 className="mt-xl font-display text-2xl font-bold leading-tight tracking-tight">
              {s.objHeading}
            </h3>
          ) : null}
          <ul className="mb-lg flex max-w-[44rem] list-none flex-col gap-md p-0">
            {lines.map((item, i) =>
              item ? (
                <li
                  key={`${item.objLineTitle}-${i}`}
                  className="border-l-2 border-line pl-md"
                >
                  <strong>{item.objLineTitle}:</strong>{" "}
                  <span>{item.objLineBody}</span>
                </li>
              ) : null
            )}
          </ul>
          {s.objFooterHtml ? (
            <p
              className="type-muted max-w-[40rem]"
              dangerouslySetInnerHTML={{ __html: s.objFooterHtml }}
            />
          ) : null}
          {ctas.length > 0 ? (
            <div className="mt-lg flex flex-wrap gap-sm">
              {ctas.map((b, i) =>
                b ? (
                  <a
                    key={`${b.objCtaHref}-${i}`}
                    href={b.objCtaHref}
                    className={btnClassForTone(b.objCtaTone ?? "outline")}
                    target={b.objCtaExternal ? "_blank" : undefined}
                    rel={b.objCtaExternal ? "noopener noreferrer" : undefined}
                  >
                    {b.objCtaExternal ? <IconExt /> : null}
                    {b.objCtaLabel}
                  </a>
                ) : null
              )}
            </div>
          ) : null}
        </SectionWrap>
      );
    }
    case "PageSectionsContactSection": {
      const s = section;
      return (
        <SectionWrap variant="dark" id="contact">
          <h2 className="type-display-lg">{s.ctHeading}</h2>
          <div className="type-lede max-w-[40rem] text-mist/85 [&_p]:mb-md [&_p:last-child]:mb-0">
            {s.ctSubheading ? (
              <p className="font-display text-lg font-bold text-mist">
                {s.ctSubheading}
              </p>
            ) : null}
            {s.ctAddressHtml ? (
              <p
                className="m-0"
                dangerouslySetInnerHTML={{ __html: s.ctAddressHtml }}
              />
            ) : null}
            {s.ctNoteHtml ? (
              <p
                className="m-0 text-mist/70"
                dangerouslySetInnerHTML={{ __html: s.ctNoteHtml }}
              />
            ) : null}
            <p className="m-0">
              <a
                className="font-medium text-accent-soft underline decoration-accent-soft/40 underline-offset-2 hover:decoration-accent-soft"
                href={`mailto:${s.ctEmail}`}
              >
                {s.ctEmail}
              </a>
            </p>
            <p className="m-0">
              <a
                className="font-medium text-accent-soft underline decoration-accent-soft/40 underline-offset-2 hover:decoration-accent-soft"
                href={`tel:${s.ctPhoneTel}`}
              >
                {s.ctPhoneDisplay}
              </a>
            </p>
          </div>
        </SectionWrap>
      );
    }
    case "PageSectionsTwoColumnDonateHero": {
      const s = section;
      return (
        <SectionWrap>
          <div className="grid grid-cols-1 items-stretch gap-xl lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="min-w-0">
              <h1 className="type-display-xl">{s.dchTitle}</h1>
              <p className="type-lede">{s.dchLede}</p>
              <div className="mt-md flex flex-wrap gap-sm">
                <a
                  href={s.dchButtonHref}
                  className={btnClassForTone(s.dchButtonTone ?? "surge")}
                  target={s.dchExternal ? "_blank" : undefined}
                  rel={s.dchExternal ? "noopener noreferrer" : undefined}
                >
                  {s.dchExternal ? <IconExt /> : null}
                  {s.dchButtonLabel}
                </a>
              </div>
            </div>
            <figure className="m-0 aspect-[4/3] min-w-0 overflow-hidden rounded-lg border border-line lg:aspect-auto lg:h-full lg:min-h-0">
              <ResponsiveImage
                src={s.dchImage}
                alt={imageAlt(s.dchImageAlt, `${s.dchTitle} — photo`)}
                width={1080}
                height={1080}
                loading="eager"
                decoding="async"
                sizes="(min-width: 1024px) min(520px, 42vw), 92vw"
                className="block h-full w-full object-cover"
              />
            </figure>
          </div>
        </SectionWrap>
      );
    }
    case "PageSectionsBulletBand": {
      const s = section;
      const variant = s.bbVariant === "dark" ? "dark" : "light";
      const lines = (s.bbLines ?? []).filter(
        (x): x is string => x != null && String(x).length > 0
      );
      return (
        <SectionWrap variant={variant === "dark" ? "dark" : "light"}>
          <h2 className="type-display-lg">{s.bbHeading}</h2>
          <ul
            className={cn(
              "my-0 pl-[1.2rem] leading-[1.8]",
              variant === "dark" ? "text-mist/85" : ""
            )}
          >
            {lines.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </SectionWrap>
      );
    }
    case "PageSectionsSplitImageText": {
      const s = section;
      const variant = s.sitVariant === "dark" ? "dark" : "light";
      const imageLeft = s.sitImagePosition === "left";
      const borderImg =
        variant === "dark"
          ? "border border-white/[0.12]"
          : "border border-line";
      return (
        <SectionWrap variant={variant === "dark" ? "dark" : "light"}>
          <div className="grid grid-cols-1 items-center gap-xl lg:grid-cols-[1fr_0.9fr]">
            <div className={cn("min-w-0", imageLeft && "lg:order-2")}>
              <h2 className="type-display-lg">{s.sitHeading}</h2>
              <p
                className={cn(
                  "mb-md max-w-[40rem]",
                  variant === "dark" ? "text-mist/80" : "type-muted"
                )}
                dangerouslySetInnerHTML={{ __html: s.sitBody }}
              />
              {s.sitButtonLabel?.trim() && s.sitButtonHref?.trim() ? (
                <a
                  href={s.sitButtonHref}
                  className={btnClassForTone(s.sitButtonTone ?? "primary")}
                  target={s.sitExternal ? "_blank" : undefined}
                  rel={s.sitExternal ? "noopener noreferrer" : undefined}
                >
                  {s.sitExternal ? <IconExt /> : null}
                  {s.sitButtonLabel}
                </a>
              ) : null}
            </div>
            <figure
              className={cn(
                "m-0 max-h-[22rem] min-w-0 overflow-hidden rounded-lg",
                borderImg,
                imageLeft && "lg:order-1"
              )}
            >
              <ResponsiveImage
                src={s.sitImage}
                alt={imageAlt(s.sitImageAlt, `${s.sitHeading} — photo`)}
                width={1152}
                height={2048}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) min(520px, 42vw), 92vw"
                className="block h-[22rem] w-full object-cover"
              />
            </figure>
          </div>
        </SectionWrap>
      );
    }
    case "PageSectionsHomeHeroFull":
      return <HomeHeroFullVisual section={section} />;
    case "PageSectionsHomeMarquee":
      return <MarqueeStripVisual text={section.hmrText} />;
    case "PageSectionsWhoScroll":
      return section.wscShowWhoScroll !== false ? (
        <WhoScrollArchVisual section={section} />
      ) : null;
    case "PageSectionsHomeProgramsIntro":
      return <HomeProgramsCardsVisual section={section} />;
    case "PageSectionsHomeMeetups": {
      const s = section;
      return (
        <SectionWrap id="meetups">
          <p className="type-section-yell">{s.hmuEyebrow}</p>
          <h2 className="type-display-lg">{s.hmuHeading}</h2>
          <p
            className="type-lede"
            dangerouslySetInnerHTML={{ __html: s.hmuLedeHtml }}
          />
          <div className="my-lg grid grid-cols-1 items-start gap-md md:grid-cols-[1.4fr_1fr]">
            <figure className="m-0 min-w-0 rounded-xl border-[3px] border-ink shadow-[6px_6px_0_0_var(--color-buzz)]">
              <div className="overflow-hidden rounded-[inherit]">
                <ResponsiveImage
                  src={s.hmuImageLeft}
                  alt={imageAlt(s.hmuImageLeftAlt, `${s.hmuHeading} — photo`)}
                  width={2048}
                  height={1365}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 768px) 55vw, 92vw"
                  className="block w-full"
                />
              </div>
            </figure>
            <figure className="m-0 min-w-0 rounded-xl border-[3px] border-ink shadow-[6px_6px_0_0_var(--color-surge)]">
              <div className="overflow-hidden rounded-[inherit]">
                <ResponsiveImage
                  src={s.hmuImageRight}
                  alt={imageAlt(s.hmuImageRightAlt, `${s.hmuHeading} — photo`)}
                  width={1080}
                  height={1350}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 768px) 40vw, 92vw"
                  className="w-full bg-mist object-contain"
                />
              </div>
            </figure>
          </div>
          <a
            href={s.hmuButtonHref}
            className={btnClassForTone(s.hmuButtonTone ?? "primary")}
            target={s.hmuExternal ? "_blank" : undefined}
            rel={s.hmuExternal ? "noopener noreferrer" : undefined}
          >
            {s.hmuExternal ? <IconExt /> : null}
            {s.hmuButtonLabel}
          </a>
        </SectionWrap>
      );
    }
    case "PageSectionsHomeSupportBand": {
      const s = section;
      return (
        <SectionWrap variant="dark" id="support">
          <div className="grid grid-cols-1 items-center gap-xl lg:grid-cols-[1fr_1.1fr]">
            <figure className="m-0 min-w-0 overflow-hidden rounded-xl border-[3px] border-buzz/40 shadow-[8px_8px_0_0_rgba(176,184,255,0.18)]">
              <ResponsiveImage
                src={s.hsbImage}
                alt={imageAlt(s.hsbImageAlt, `${s.hsbHeading} — photo`)}
                width={1080}
                height={1080}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1024px) min(520px, 42vw), 92vw"
                className="block w-full"
              />
            </figure>
            <div className="min-w-0">
              <p className="mb-0 text-buzz font-display text-[0.7rem] font-extrabold uppercase tracking-[0.28em]">
                {s.hsbEyebrow}
              </p>
              <h2 className="type-display-lg">{s.hsbHeading}</h2>
              <p
                className="type-lede text-mist/75"
                dangerouslySetInnerHTML={{ __html: s.hsbLedeHtml }}
              />
              <a
                href={s.hsbButtonHref}
                className={btnClassForTone(s.hsbButtonTone ?? "surge")}
                target={s.hsbButtonExternal ? "_blank" : undefined}
                rel={s.hsbButtonExternal ? "noopener noreferrer" : undefined}
              >
                {s.hsbButtonExternal ? <IconExt /> : null}
                {s.hsbButtonLabel}
              </a>
            </div>
          </div>
        </SectionWrap>
      );
    }
    case "PageSectionsHomeMoreGrid": {
      const s = section;
      const cards = (s.hmgCards ?? []).filter(Boolean);
      const shadows = [
        "shadow-[6px_6px_0_0_var(--color-ink)]",
        "shadow-[6px_6px_0_0_var(--color-club)]",
        "shadow-[6px_6px_0_0_var(--color-surge)]",
      ];
      return (
        <SectionWrap id="more">
          <p className="type-section-yell">{s.hmgEyebrow}</p>
          <h2 className="type-display-lg">{s.hmgHeading}</h2>
          <p
            className="type-lede"
            dangerouslySetInnerHTML={{ __html: s.hmgLedeHtml }}
          />
          <div className="mt-md grid grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-md">
            {cards.map((card, i) =>
              card ? (
                <article
                  key={`${card.hmgCardTitle}-${i}`}
                  className={cn(
                    "flex flex-col overflow-hidden rounded-xl border-[3px] border-ink bg-white/40 p-0 transition-transform duration-300 hover:-translate-y-1",
                    shadows[i % 3]
                  )}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <ResponsiveImage
                      src={card.hmgCardImage}
                      alt={imageAlt(
                        card.hmgCardImageAlt,
                        `${card.hmgCardTitle} — photo`
                      )}
                      width={1440}
                      height={1440}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 1280px) min(28vw, 400px), (min-width: 1024px) min(42vw, 480px), 92vw"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="mx-lg mb-xs mt-md font-display text-[1.15rem]">
                    {card.hmgCardTitle}
                  </h3>
                  <p className="type-muted mx-lg mb-md">
                    {card.hmgCardDescription}
                  </p>
                  <a
                    href={card.hmgCardButtonHref}
                    className={`${btnOutline} mb-lg ml-lg self-start`}
                    target={card.hmgCardExternal ? "_blank" : undefined}
                    rel={
                      card.hmgCardExternal ? "noopener noreferrer" : undefined
                    }
                  >
                    {card.hmgCardExternal ? <IconExt /> : null}
                    {card.hmgCardButtonLabel}
                  </a>
                </article>
              ) : null
            )}
          </div>
        </SectionWrap>
      );
    }
    case "PageSectionsHomeCtaBand": {
      const s = section;
      const buttons = (s.hcbButtons ?? []).filter(Boolean);
      return (
        <section
          className="dark-surface border-y border-buzz/30 bg-[linear-gradient(120deg,#1c1c33_0%,#0e0e1a_48%,#25244a_100%)] py-2xl text-mist"
          aria-labelledby="cta-band-title"
        >
          <div className="site-container grid grid-cols-1 items-center gap-xl lg:grid-cols-[0.9fr_1.1fr]">
            <ResponsiveImage
              src={s.hcbImage}
              alt={imageAlt(s.hcbImageAlt, `${s.hcbHeading} — photo`)}
              width={1125}
              height={1138}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1024px) min(520px, 42vw), 92vw"
              className="max-h-[22rem] w-full min-w-0 rotate-[0.4deg] rounded-xl border-[3px] border-buzz/35 object-cover shadow-[8px_8px_0_0_rgba(176,184,255,0.16)]"
            />
            <div className="min-w-0">
              <p className="mb-0 text-buzz font-display text-[0.7rem] font-extrabold uppercase tracking-[0.28em]">
                {s.hcbEyebrow}
              </p>
              <h2 id="cta-band-title" className="type-display-lg text-mist">
                {s.hcbHeading}
              </h2>
              <p
                className="mb-md max-w-[40rem] text-[1.2rem] leading-[1.55] text-mist/75"
                dangerouslySetInnerHTML={{ __html: s.hcbBodyHtml }}
              />
              <div className="flex max-w-[40rem] flex-col gap-sm">
                {buttons[0] ? (
                  <a
                    href={buttons[0].hcbBtnHref}
                    className={cn(
                      "w-full",
                      btnClassForTone(buttons[0].hcbBtnTone ?? "surge")
                    )}
                    target={buttons[0].hcbBtnExternal ? "_blank" : undefined}
                    rel={
                      buttons[0].hcbBtnExternal
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {buttons[0].hcbBtnExternal ? <IconExt /> : null}
                    {buttons[0].hcbBtnLabel}
                  </a>
                ) : null}
                {buttons.length > 1 ? (
                  <div className="flex w-full flex-col gap-sm lg:flex-row">
                    {buttons.slice(1).map((b, i) =>
                      b ? (
                        <a
                          key={`${b.hcbBtnHref}-${i}`}
                          href={b.hcbBtnHref}
                          className={cn(
                            "w-full lg:flex-1",
                            btnClassForTone(b.hcbBtnTone ?? "outline")
                          )}
                          target={b.hcbBtnExternal ? "_blank" : undefined}
                          rel={
                            b.hcbBtnExternal ? "noopener noreferrer" : undefined
                          }
                        >
                          {b.hcbBtnExternal ? <IconExt /> : null}
                          {b.hcbBtnLabel}
                        </a>
                      ) : null
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      );
    }
    default:
      return null;
  }
}

export default function PageStatic({
  data,
}: {
  data: PageQuery;
}) {
  const page = data.page;
  if (!page) return null;
  const sections = (page.sections ?? []).filter(Boolean) as PageSectionItem[];
  return (
    <>
      {sections.map((sec, i) => (
        <PageSectionView key={`${sec.__typename}-${i}`} section={sec} />
      ))}
    </>
  );
}


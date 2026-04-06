import { tinaField, useTina } from "tinacms/dist/react";
import { useEffect } from "react";
import type { PageQuery, PageQueryVariables } from "../../../tina/__generated__/types";
import { cn } from "../../lib/cn";
import { btnClassForTone } from "../../lib/tina-button-tone";
import { btnOutline } from "../../lib/tina-ui-buttons";
import { mountProgramCardsTilt } from "../../scripts/program-cards-tilt";
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

type Props = {
  query: string;
  variables: PageQueryVariables;
  data: PageQuery;
  pageSlug: string;
};

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
          <h1
            className="type-display-xl"
            data-tina-field={tinaField(s, "introTitle")}
          >
            {s.introTitle}
          </h1>
          {s.introLede ? (
            <p
              className="type-lede"
              data-tina-field={tinaField(s, "introLede")}
            >
              {s.introLede}
            </p>
          ) : null}
          {src ? (
            <figure className="mt-lg max-w-3xl overflow-hidden rounded-lg border border-line">
              <img
                src={src}
                alt={s.introImageAlt ?? ""}
                width={748}
                height={880}
                loading="eager"
                decoding="async"
                className="block w-full"
                data-tina-field={tinaField(s, "introImage")}
              />
            </figure>
          ) : null}
        </SectionWrap>
      );
    }
    case "PageSectionsProseBand": {
      const s = section;
      const variant = s.pbVariant === "dark" ? "dark" : "light";
      const imgSrc = s.pbTopImage?.trim();
      return (
        <SectionWrap variant={variant === "dark" ? "dark" : "light"}>
          {imgSrc ? (
            <div className="mb-lg max-w-xl">
              <img
                src={imgSrc}
                alt={s.pbTopImageAlt ?? ""}
                width={1317}
                height={1756}
                loading="lazy"
                decoding="async"
                className={cn(
                  "w-full rounded-lg border",
                  variant === "dark" ? "border-white/[0.12]" : "border-line"
                )}
                data-tina-field={tinaField(s, "pbTopImage")}
              />
            </div>
          ) : null}
          {s.pbHeading ? (
            <h2
              className="type-display-lg"
              data-tina-field={tinaField(s, "pbHeading")}
            >
              {s.pbHeading}
            </h2>
          ) : null}
          {s.pbBodyHtml ? (
            <div
              className="prose-inner max-w-[48rem] [&_p]:mb-md [&_strong]:font-semibold [&_a]:font-medium [&_a]:text-accent-soft [&_a]:no-underline hover:[&_a]:underline"
              data-tina-field={tinaField(s, "pbBodyHtml")}
              dangerouslySetInnerHTML={{ __html: s.pbBodyHtml }}
            />
          ) : null}
        </SectionWrap>
      );
    }
    case "PageSectionsMissionQuote": {
      const s = section;
      return (
        <SectionWrap>
          <h2 className="type-display-lg">Our mission</h2>
          {s.mqQuoteText ? (
            <blockquote
              className="m-0 rounded-r-lg border-l-4 border-accent bg-accent/[0.08] p-lg text-[1.1rem] italic leading-relaxed"
              data-tina-field={tinaField(s, "mqQuoteText")}
            >
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
            <h3
              className="mt-xl font-display text-2xl font-bold leading-tight tracking-tight"
              data-tina-field={tinaField(s, "objHeading")}
            >
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
                  <strong data-tina-field={tinaField(item, "objLineTitle")}>
                    {item.objLineTitle}:
                  </strong>{" "}
                  <span data-tina-field={tinaField(item, "objLineBody")}>
                    {item.objLineBody}
                  </span>
                </li>
              ) : null
            )}
          </ul>
          {s.objFooterHtml ? (
            <p
              className="type-muted max-w-[40rem]"
              data-tina-field={tinaField(s, "objFooterHtml")}
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
                    data-tina-field={tinaField(b, "objCtaLabel")}
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
          <h2
            className="type-display-lg"
            data-tina-field={tinaField(s, "ctHeading")}
          >
            {s.ctHeading}
          </h2>
          <div className="type-lede max-w-[40rem] text-mist/85 [&_p]:mb-md [&_p:last-child]:mb-0">
            {s.ctSubheading ? (
              <p
                className="font-display text-lg font-bold text-mist"
                data-tina-field={tinaField(s, "ctSubheading")}
              >
                {s.ctSubheading}
              </p>
            ) : null}
            {s.ctAddressHtml ? (
              <p
                className="m-0"
                data-tina-field={tinaField(s, "ctAddressHtml")}
                dangerouslySetInnerHTML={{ __html: s.ctAddressHtml }}
              />
            ) : null}
            {s.ctNoteHtml ? (
              <p
                className="m-0 text-mist/70"
                data-tina-field={tinaField(s, "ctNoteHtml")}
                dangerouslySetInnerHTML={{ __html: s.ctNoteHtml }}
              />
            ) : null}
            <p className="m-0">
              <a
                className="font-medium text-accent-soft underline decoration-accent-soft/40 underline-offset-2 hover:decoration-accent-soft"
                href={`mailto:${s.ctEmail}`}
                data-tina-field={tinaField(s, "ctEmail")}
              >
                {s.ctEmail}
              </a>
            </p>
            <p className="m-0">
              <a
                className="font-medium text-accent-soft underline decoration-accent-soft/40 underline-offset-2 hover:decoration-accent-soft"
                href={`tel:${s.ctPhoneTel}`}
                data-tina-field={tinaField(s, "ctPhoneDisplay")}
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
              <h1
                className="type-display-xl"
                data-tina-field={tinaField(s, "dchTitle")}
              >
                {s.dchTitle}
              </h1>
              <p
                className="type-lede"
                data-tina-field={tinaField(s, "dchLede")}
              >
                {s.dchLede}
              </p>
              <div className="mt-md flex flex-wrap gap-sm">
                <a
                  href={s.dchButtonHref}
                  className={btnClassForTone(s.dchButtonTone ?? "surge")}
                  target={s.dchExternal ? "_blank" : undefined}
                  rel={s.dchExternal ? "noopener noreferrer" : undefined}
                  data-tina-field={tinaField(s, "dchButtonLabel")}
                >
                  {s.dchExternal ? <IconExt /> : null}
                  {s.dchButtonLabel}
                </a>
              </div>
            </div>
            <figure className="m-0 aspect-[4/3] min-w-0 overflow-hidden rounded-lg border border-line lg:aspect-auto lg:h-full lg:min-h-0">
              <img
                src={s.dchImage}
                alt={s.dchImageAlt}
                width={1080}
                height={1080}
                loading="eager"
                decoding="async"
                className="block h-full w-full object-cover"
                data-tina-field={tinaField(s, "dchImage")}
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
          <h2
            className="type-display-lg"
            data-tina-field={tinaField(s, "bbHeading")}
          >
            {s.bbHeading}
          </h2>
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
              <h2
                className="type-display-lg"
                data-tina-field={tinaField(s, "sitHeading")}
              >
                {s.sitHeading}
              </h2>
              <p
                className={cn(
                  "mb-md max-w-[40rem]",
                  variant === "dark" ? "text-mist/80" : "type-muted"
                )}
                data-tina-field={tinaField(s, "sitBody")}
                dangerouslySetInnerHTML={{ __html: s.sitBody }}
              />
              {s.sitButtonLabel?.trim() && s.sitButtonHref?.trim() ? (
                <a
                  href={s.sitButtonHref}
                  className={btnClassForTone(s.sitButtonTone ?? "primary")}
                  target={s.sitExternal ? "_blank" : undefined}
                  rel={s.sitExternal ? "noopener noreferrer" : undefined}
                  data-tina-field={tinaField(s, "sitButtonLabel")}
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
              <img
                src={s.sitImage}
                alt={s.sitImageAlt}
                width={1152}
                height={2048}
                loading="lazy"
                decoding="async"
                className="block h-[22rem] w-full object-cover"
                data-tina-field={tinaField(s, "sitImage")}
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
          <p
            className="type-section-yell"
            data-tina-field={tinaField(s, "hmuEyebrow")}
          >
            {s.hmuEyebrow}
          </p>
          <h2
            className="type-display-lg"
            data-tina-field={tinaField(s, "hmuHeading")}
          >
            {s.hmuHeading}
          </h2>
          <p
            className="type-lede"
            data-tina-field={tinaField(s, "hmuLedeHtml")}
            dangerouslySetInnerHTML={{ __html: s.hmuLedeHtml }}
          />
          <div className="my-lg grid grid-cols-1 items-start gap-md md:grid-cols-[1.4fr_1fr]">
            <figure
              className="m-0 min-w-0 rounded-xl border-[3px] border-ink shadow-[6px_6px_0_0_var(--color-buzz)]"
              data-tina-field={tinaField(s, "hmuImageLeft")}
            >
              <div className="overflow-hidden rounded-[inherit]">
                <img
                  src={s.hmuImageLeft}
                  alt={s.hmuImageLeftAlt}
                  width={2048}
                  height={1365}
                  loading="lazy"
                  decoding="async"
                  className="block w-full"
                />
              </div>
            </figure>
            <figure
              className="m-0 min-w-0 rounded-xl border-[3px] border-ink shadow-[6px_6px_0_0_var(--color-surge)]"
              data-tina-field={tinaField(s, "hmuImageRight")}
            >
              <div className="overflow-hidden rounded-[inherit]">
                <img
                  src={s.hmuImageRight}
                  alt={s.hmuImageRightAlt}
                  width={1080}
                  height={1350}
                  loading="lazy"
                  decoding="async"
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
            data-tina-field={tinaField(s, "hmuButtonLabel")}
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
              <img
                src={s.hsbImage}
                alt={s.hsbImageAlt}
                width={1080}
                height={1080}
                loading="lazy"
                decoding="async"
                className="block w-full"
                data-tina-field={tinaField(s, "hsbImage")}
              />
            </figure>
            <div className="min-w-0">
              <p
                className="mb-0 text-buzz font-display text-[0.7rem] font-extrabold uppercase tracking-[0.28em]"
                data-tina-field={tinaField(s, "hsbEyebrow")}
              >
                {s.hsbEyebrow}
              </p>
              <h2
                className="type-display-lg"
                data-tina-field={tinaField(s, "hsbHeading")}
              >
                {s.hsbHeading}
              </h2>
              <p
                className="type-lede text-mist/75"
                data-tina-field={tinaField(s, "hsbLedeHtml")}
                dangerouslySetInnerHTML={{ __html: s.hsbLedeHtml }}
              />
              <a
                href={s.hsbButtonHref}
                className={btnClassForTone(s.hsbButtonTone ?? "surge")}
                target={s.hsbButtonExternal ? "_blank" : undefined}
                rel={s.hsbButtonExternal ? "noopener noreferrer" : undefined}
                data-tina-field={tinaField(s, "hsbButtonLabel")}
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
          <p
            className="type-section-yell"
            data-tina-field={tinaField(s, "hmgEyebrow")}
          >
            {s.hmgEyebrow}
          </p>
          <h2
            className="type-display-lg"
            data-tina-field={tinaField(s, "hmgHeading")}
          >
            {s.hmgHeading}
          </h2>
          <p
            className="type-lede"
            data-tina-field={tinaField(s, "hmgLedeHtml")}
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
                    <img
                      src={card.hmgCardImage}
                      alt={card.hmgCardImageAlt ?? ""}
                      width={1440}
                      height={1440}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      data-tina-field={tinaField(card, "hmgCardImage")}
                    />
                  </div>
                  <h3
                    className="mx-lg mb-xs mt-md font-display text-[1.15rem]"
                    data-tina-field={tinaField(card, "hmgCardTitle")}
                  >
                    {card.hmgCardTitle}
                  </h3>
                  <p
                    className="type-muted mx-lg mb-md"
                    data-tina-field={tinaField(card, "hmgCardDescription")}
                  >
                    {card.hmgCardDescription}
                  </p>
                  <a
                    href={card.hmgCardButtonHref}
                    className={`${btnOutline} mb-lg ml-lg self-start`}
                    target={card.hmgCardExternal ? "_blank" : undefined}
                    rel={
                      card.hmgCardExternal ? "noopener noreferrer" : undefined
                    }
                    data-tina-field={tinaField(card, "hmgCardButtonLabel")}
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
            <img
              src={s.hcbImage}
              alt={s.hcbImageAlt}
              width={1125}
              height={1138}
              loading="lazy"
              decoding="async"
              className="max-h-[22rem] w-full min-w-0 rotate-[0.4deg] rounded-xl border-[3px] border-buzz/35 object-cover shadow-[8px_8px_0_0_rgba(176,184,255,0.16)]"
              data-tina-field={tinaField(s, "hcbImage")}
            />
            <div className="min-w-0">
              <p
                className="mb-0 text-buzz font-display text-[0.7rem] font-extrabold uppercase tracking-[0.28em]"
                data-tina-field={tinaField(s, "hcbEyebrow")}
              >
                {s.hcbEyebrow}
              </p>
              <h2
                id="cta-band-title"
                className="type-display-lg text-mist"
                data-tina-field={tinaField(s, "hcbHeading")}
              >
                {s.hcbHeading}
              </h2>
              <p
                className="mb-md max-w-[40rem] text-[1.2rem] leading-[1.55] text-mist/75"
                data-tina-field={tinaField(s, "hcbBodyHtml")}
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
                    data-tina-field={tinaField(buttons[0], "hcbBtnLabel")}
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
                          data-tina-field={tinaField(b, "hcbBtnLabel")}
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

export default function PageVisualEdit({
  query,
  variables,
  data: initialData,
  pageSlug,
}: Props) {
  const { data } = useTina({ query, variables, data: initialData });
  const page = data.page;
  if (!page) return null;

  const sections = (page.sections ?? []).filter(
    Boolean,
  ) as PageSectionItem[];

  useEffect(() => {
    if (pageSlug !== "home") return;
    const h = mountProgramCardsTilt();
    return () => h.destroy();
  }, [pageSlug, sections.length]);

  return (
    <>
      {sections.map((sec, i) => (
        <PageSectionView key={`${sec.__typename}-${i}`} section={sec} />
      ))}
    </>
  );
}

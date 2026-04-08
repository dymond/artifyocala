import { tinaField, useTina } from "tinacms/dist/react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type {
  ProgramQuery,
  ProgramQueryVariables,
} from "../../../tina/__generated__/types";
import { brickGlamGallery, img, storytellingKnightsGallery } from "../../lib/site-images";
import { LINKS, mailtoTourMakerCollective } from "../../lib/links";
import GalleryMarqueeIsland, {
  type GalleryMarqueeSlide,
} from "./GalleryMarqueeIsland";
import ResponsiveImage from "../ui/ResponsiveImage";

import {
  btnOutline,
  btnSurge,
} from "../../lib/tina-ui-buttons";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3.5 font-display text-xs font-extrabold uppercase tracking-[0.14em] no-underline cursor-pointer transition-all duration-200 ease-out";

const btnPrimary = `${btnBase} border-2 border-ink bg-[color:var(--color-cta-fill)] text-mist shadow-[4px_4px_0_0_var(--color-ink)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none`;

const btnGhost = `${btnBase} border-2 border-transparent bg-transparent text-ink shadow-[3px_3px_0_0_var(--color-ink)] hover:border-ink/20 hover:bg-ink/[0.05] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_0_var(--color-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none`;

const proseDark =
  "prose-inner max-w-[48rem] [&_h2]:font-display [&_h2]:text-[1.65rem] [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:mt-xl [&_h2]:mb-sm [&_h2:first-child]:mt-0 [&_h3]:text-[1.15rem] [&_h3]:font-semibold [&_h3]:mt-lg [&_h3]:mb-xs [&_p]:mb-md [&_ul]:mb-md [&_ul]:pl-5 [&_li]:mb-xs [&_a]:font-medium [&_a]:text-accent-soft [&_a]:no-underline hover:[&_a]:underline [&_strong]:font-semibold";

type Props = {
  query: string;
  variables: ProgramQueryVariables;
  data: ProgramQuery;
  slug: string;
};

type HeroSlide = { src: string; alt: string };
type CtaRow = {
  label: string;
  href: string;
  external?: boolean;
  tone?: "primary" | "outline" | "surge" | "ghost";
};

type SlugDefaults = {
  heroLayout: "singleStandard" | "singleTall" | "twoStacked";
  heroSlides: HeroSlide[];
  ctas: CtaRow[];
  galleryEnable: boolean;
  galleryHeading: string;
  galleryDekHtml: string;
  gallerySurface: "light" | "dark";
  galleryMarqueeAlt: string;
  gallerySlides: GalleryMarqueeSlide[];
};

function nonNull<T>(arr: Array<T | null | undefined> | null | undefined): T[] {
  return (arr ?? []).filter((x): x is T => x != null);
}

function IconExternal({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 opacity-95 ${className ?? ""}`}
      aria-hidden
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function ctaToneClass(tone: CtaRow["tone"]): string {
  switch (tone ?? "outline") {
    case "primary":
      return btnPrimary;
    case "ghost":
      return btnGhost;
    case "surge":
      return btnSurge;
    default:
      return btnOutline;
  }
}

function slugDefaults(slug: string): SlugDefaults | null {
  if (slug === "maker-collective") {
    return {
      heroLayout: "singleStandard",
      heroSlides: [
        {
          src: img.makerspaceBanner,
          alt: "Marion County Maker Collective",
        },
      ],
      ctas: [
        { label: "Schedule a tour", href: mailtoTourMakerCollective() },
        {
          label: "Apply for membership",
          href: LINKS.boloMembershipApply,
          external: true,
          tone: "outline",
        },
        {
          label: "Donate",
          href: LINKS.zeffyDonate,
          external: true,
          tone: "outline",
        },
        {
          label: "Equipment wish list",
          href: "/programs/maker-collective/equipment",
          tone: "outline",
        },
      ],
      galleryEnable: true,
      galleryHeading: "Makerspace & community",
      galleryDekHtml: "",
      gallerySurface: "light",
      galleryMarqueeAlt: "Marion County Maker Collective",
      gallerySlides: [
        img.makerspaceA,
        img.makerspaceB,
        img.makerspaceC,
        img.makerspaceD,
        img.makerspaceE,
      ].map((src, i) => ({
        src,
        alt: `Marion County Maker Collective ${i + 1}`,
      })),
    };
  }
  if (slug === "brick-city-glam") {
    return {
      heroLayout: "singleTall",
      heroSlides: [
        {
          src: img.programGlam,
          alt: "Brick City Glam performance",
        },
      ],
      ctas: [
        {
          label: "Upcoming performances",
          href: LINKS.brickCityGlamFacebook,
          external: true,
          tone: "surge",
        },
        {
          label: "Casting form",
          href: LINKS.jotformCasting,
          external: true,
          tone: "outline",
        },
      ],
      galleryEnable: true,
      galleryHeading: "Photo gallery",
      galleryDekHtml:
        "<p>Moments from performances, collaborations, and community events.</p>",
      gallerySurface: "dark",
      galleryMarqueeAlt: "Brick City Glam",
      gallerySlides: [...brickGlamGallery].map((src, i) => ({
        src,
        alt: `Brick City Glam ${i + 1}`,
      })),
    };
  }
  if (slug === "storytelling-knights") {
    return {
      heroLayout: "twoStacked",
      heroSlides: [
        {
          src: img.storytellingA,
          alt: "Storytelling Knights tabletop session",
        },
        {
          src: img.storytellingB,
          alt: "Storytelling Knights community",
        },
      ],
      ctas: [
        {
          label: "Sign up for events",
          href: LINKS.zeffyStorytellingSignup,
          external: true,
          tone: "surge",
        },
      ],
      galleryEnable: true,
      galleryHeading: "Photo gallery",
      galleryDekHtml: `<p class="type-muted mb-0 max-w-[40rem]">Scenes from our tables and events. Follow <a class="font-medium text-ink underline decoration-ink/35 underline-offset-2 hover:decoration-ink" href="${LINKS.storytellingKnightsInstagram}" rel="noopener noreferrer" target="_blank">@storytellingknights on Instagram</a> for the latest photos and announcements.</p>`,
      gallerySurface: "light",
      galleryMarqueeAlt: "Storytelling Knights",
      gallerySlides: [...storytellingKnightsGallery].map((src, i) => ({
        src,
        alt: `Storytelling Knights ${i + 1}`,
      })),
    };
  }
  return null;
}

function HeroImages({
  layout,
  slides,
  program,
}: {
  layout: SlugDefaults["heroLayout"];
  slides: HeroSlide[];
  program: NonNullable<ProgramQuery["program"]>;
}) {
  if (slides.length === 0) return null;

  if (layout === "twoStacked") {
    const [a, b] = slides;
    return (
      <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-sm sm:grid-cols-[2fr_0.55fr]">
        {a ? (
          <ResponsiveImage
            src={a.src}
            alt={a.alt}
            width={2048}
            height={1365}
            className="w-full min-w-0 rounded-lg border border-line"
            loading="eager"
            decoding="async"
            sizes="(min-width: 768px) 65vw, 92vw"
            data-tina-field={
              program.progHeroSlides?.[0]
                ? tinaField(program.progHeroSlides[0], "progHeroImage")
                : undefined
            }
          />
        ) : null}
        {b ? (
          <ResponsiveImage
            src={b.src}
            alt={b.alt}
            width={303}
            height={479}
            className="max-h-80 w-full min-w-0 rounded-lg border border-line object-cover"
            loading="eager"
            decoding="async"
            sizes="(min-width: 768px) 25vw, 92vw"
            data-tina-field={
              program.progHeroSlides?.[1]
                ? tinaField(program.progHeroSlides[1], "progHeroImage")
                : undefined
            }
          />
        ) : null}
      </div>
    );
  }

  const first = slides[0];
  if (!first) return null;

  const imgClass =
    layout === "singleTall"
      ? "max-h-[28rem] w-full min-w-0 rounded-lg border border-line object-cover"
      : "w-full min-w-0 rounded-lg border border-line";

  return (
    <ResponsiveImage
      src={first.src}
      alt={first.alt}
      width={layout === "singleTall" ? 1125 : 940}
      height={layout === "singleTall" ? 1138 : 788}
      className={imgClass}
      loading="eager"
      decoding="async"
      sizes="(min-width: 768px) 55vw, 92vw"
      data-tina-field={
        program.progHeroSlides?.[0]
          ? tinaField(program.progHeroSlides[0], "progHeroImage")
          : undefined
      }
    />
  );
}

export default function ProgramVisualEdit({
  query,
  variables,
  data: initialData,
  slug,
}: Props) {
  const { data } = useTina({
    query,
    variables,
    data: initialData,
  });

  const p = data.program;
  if (!p) {
    return null;
  }

  const defaults = slugDefaults(slug);

  const heroLayout = (p.progHeroLayout ||
    defaults?.heroLayout ||
    "singleStandard") as SlugDefaults["heroLayout"];

  const tinaHero = nonNull(p.progHeroSlides).map((s) => ({
    src: s.progHeroImage,
    alt: s.progHeroAlt?.trim() || "",
  }));

  const heroSlides: HeroSlide[] =
    tinaHero.length > 0
      ? tinaHero.map((s, i) => ({
          src: s.src,
          alt: s.alt || defaults?.heroSlides[i]?.alt || `Program image ${i + 1}`,
        }))
      : (defaults?.heroSlides ?? []);

  const tinaCtas = nonNull(p.progCtaRows).map((r) => ({
    label: r.progCtaLabel,
    href: r.progCtaHref,
    external: Boolean(r.progCtaExternal),
    tone: (r.progCtaTone || "outline") as CtaRow["tone"],
  }));

  const ctas: CtaRow[] =
    tinaCtas.length > 0 ? tinaCtas : (defaults?.ctas ?? []);

  const galleryEnable =
    p.progGalleryEnable ?? defaults?.galleryEnable ?? false;

  const galleryMarqueeAlt =
    p.progGalleryMarqueeAlt?.trim() ||
    defaults?.galleryMarqueeAlt ||
    p.title;

  const tinaGallery = nonNull(p.progGalleryStrip).map((g, i) => ({
    src: g.progGalImage,
    alt:
      g.progGalAlt?.trim() ||
      `${galleryMarqueeAlt} ${i + 1}`,
  }));

  const gallerySlides: GalleryMarqueeSlide[] =
    tinaGallery.length > 0
      ? tinaGallery
      : (defaults?.gallerySlides ?? []);

  const galleryHeading =
    p.progGalleryHeading?.trim() ||
    defaults?.galleryHeading ||
    "Photo gallery";

  const galleryDekHtml =
    p.progGalleryDekHtml ?? defaults?.galleryDekHtml ?? "";

  const gallerySurface = (p.progGallerySurface ||
    defaults?.gallerySurface ||
    "light") as "light" | "dark";

  const heroGridCols =
    slug === "brick-city-glam"
      ? "lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
      : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]";

  const galleryTestId = `${slug}-gallery-marquee`;

  const dekClass =
    gallerySurface === "dark"
      ? "relative z-20 type-muted mb-lg text-mist/70 [&_a]:text-mist [&_a]:decoration-mist/40 [&_a]:hover:decoration-mist"
      : "relative z-20 type-muted mb-lg max-w-[40rem]";

  return (
    <>
      <section className="bg-mist py-2xl text-ink">
        <div className="site-container">
          <div
            className={`grid grid-cols-1 items-start gap-xl ${heroGridCols}`}
          >
            <HeroImages layout={heroLayout} slides={heroSlides} program={p} />
            <div className="min-w-0">
              <h1
                className="type-display-xl"
                data-tina-field={tinaField(p, "title")}
              >
                {p.title}
              </h1>
              <p
                className="type-lede"
                data-tina-field={tinaField(p, "description")}
              >
                {p.description}
              </p>
              {ctas.length > 0 ? (
                <div className="mt-md flex flex-wrap gap-sm">
                  {ctas.map((a, i) => (
                    <a
                      key={`${a.href}-${a.label}-${i}`}
                      href={a.href}
                      className={ctaToneClass(a.tone)}
                      data-tina-field={
                        p.progCtaRows?.[i]
                          ? tinaField(p.progCtaRows[i], "progCtaLabel")
                          : undefined
                      }
                      {...(a.external
                        ? {
                            target: "_blank",
                            rel: "noopener noreferrer",
                          }
                        : {})}
                    >
                      {a.external ? <IconExternal /> : null}
                      {a.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="dark-surface bg-void py-2xl text-mist">
        <div className="site-container">
          <div
            className={proseDark}
            data-tina-field={tinaField(p, "body")}
          >
            <TinaMarkdown content={p.body} />
          </div>
        </div>
      </section>

      {galleryEnable && gallerySlides.length > 0 ? (
        <section
          className={`py-2xl ${
            gallerySurface === "dark"
              ? "dark-surface bg-void text-mist"
              : "bg-mist text-ink"
          }`}
        >
          <div className="site-container">
            <h2
              className="relative z-20 type-display-lg mb-md"
              data-tina-field={tinaField(p, "progGalleryHeading")}
            >
              {galleryHeading}
            </h2>
            {galleryDekHtml ? (
              <div
                className={dekClass}
                data-tina-field={tinaField(p, "progGalleryDekHtml")}
                dangerouslySetInnerHTML={{ __html: galleryDekHtml }}
              />
            ) : null}
            <GalleryMarqueeIsland
              slides={gallerySlides}
              surface={gallerySurface}
              data-testid={galleryTestId}
            />
          </div>
        </section>
      ) : null}
    </>
  );
}

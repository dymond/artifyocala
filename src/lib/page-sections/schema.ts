import { z } from "zod";

const pageIntroSchema = z.object({
  _template: z.literal("pageIntro"),
  introTitle: z.string(),
  introLede: z.string().optional().nullable(),
  introImage: z.string().optional().nullable(),
  introImageAlt: z.string().optional().nullable(),
});

const proseBandSchema = z.object({
  _template: z.literal("proseBand"),
  pbVariant: z.enum(["default", "dark"]).optional().nullable(),
  pbTopImage: z.string().optional().nullable(),
  pbTopImageAlt: z.string().optional().nullable(),
  pbHeading: z.string().optional().nullable(),
  pbBodyHtml: z.string().optional().nullable(),
});

const missionQuoteSchema = z.object({
  _template: z.literal("missionQuote"),
  mqQuoteText: z.string().optional().nullable(),
});

const objectivesListSchema = z.object({
  _template: z.literal("objectivesList"),
  objHeading: z.string().optional().nullable(),
  objLines: z
    .array(
      z.object({
        objLineTitle: z.string(),
        objLineBody: z.string(),
      })
    )
    .optional()
    .nullable(),
  objFooterHtml: z.string().optional().nullable(),
  objCtas: z
    .array(
      z.object({
        objCtaLabel: z.string(),
        objCtaHref: z.string(),
        objCtaTone: z
          .enum(["primary", "outline", "surge", "ghost"])
          .optional()
          .nullable(),
        objCtaExternal: z.boolean().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
});

const contactSectionSchema = z.object({
  _template: z.literal("contactSection"),
  ctHeading: z.string(),
  ctSubheading: z.string().optional().nullable(),
  ctAddressHtml: z.string().optional().nullable(),
  ctNoteHtml: z.string().optional().nullable(),
  ctEmail: z.string(),
  ctPhoneDisplay: z.string(),
  ctPhoneTel: z.string(),
});

const twoColumnDonateHeroSchema = z.object({
  _template: z.literal("twoColumnDonateHero"),
  dchTitle: z.string(),
  dchLede: z.string(),
  dchButtonLabel: z.string(),
  dchButtonHref: z.string(),
  dchButtonTone: z
    .enum(["primary", "outline", "surge", "ghost"])
    .optional()
    .nullable(),
  dchExternal: z.boolean().optional().nullable(),
  dchImage: z.string(),
  dchImageAlt: z.string(),
});

const bulletBandSchema = z.object({
  _template: z.literal("bulletBand"),
  bbVariant: z.enum(["default", "dark"]).optional().nullable(),
  bbHeading: z.string(),
  bbLines: z.array(z.string()).optional().nullable(),
});

const splitImageTextSchema = z.object({
  _template: z.literal("splitImageText"),
  sitVariant: z.enum(["default", "dark"]).optional().nullable(),
  sitHeading: z.string(),
  sitBody: z.string(),
  sitButtonLabel: z.string().optional().nullable(),
  sitButtonHref: z.string().optional().nullable(),
  sitButtonTone: z
    .enum(["primary", "outline", "surge", "ghost"])
    .optional()
    .nullable(),
  sitExternal: z.boolean().optional().nullable(),
  sitImage: z.string(),
  sitImageAlt: z.string(),
  sitImagePosition: z.enum(["left", "right"]).optional().nullable(),
});

const homeHeroFullSchema = z.object({
  _template: z.literal("homeHeroFull"),
  hhfEyebrow: z.string(),
  hhfTitle: z.string(),
  hhfLede: z.string(),
  hhfRotatorWords: z.array(z.string()).optional().nullable(),
  hhfHeroButtons: z
    .array(
      z.object({
        hhbLabel: z.string(),
        hhbHref: z.string(),
        hhbExternal: z.boolean().optional().nullable(),
        hhbTone: z
          .enum(["primary", "outline", "surge", "ghost"])
          .optional()
          .nullable(),
      })
    )
    .optional()
    .nullable(),
  hhfAsideBadge: z.string(),
  hhfAsideTitle: z.string(),
  hhfAsideDescription: z.string(),
  hhfAsideMeetupsHref: z.string(),
  hhfAsideMeetupsLabel: z.string(),
  hhfAsideMeetupsExternal: z.boolean().optional().nullable(),
  hhfAsideMeetupsTone: z
    .enum(["primary", "outline", "surge", "ghost"])
    .optional()
    .nullable(),
  hhfAsideStackButtons: z
    .array(
      z.object({
        habsLabel: z.string(),
        habsHref: z.string(),
        habsExternal: z.boolean().optional().nullable(),
        habsTone: z
          .enum(["primary", "outline", "surge", "ghost"])
          .optional()
          .nullable(),
      })
    )
    .optional()
    .nullable(),
  hhfHiringImage: z.string(),
  hhfHiringImageAlt: z.string(),
  hhfShowCollage: z.boolean().optional().nullable(),
  hhfCollageCards: z
    .array(
      z.object({
        hccFrontImage: z.string().optional().nullable(),
        hccFrontAlt: z.string().optional().nullable(),
        hccFrontCaption: z.string().optional().nullable(),
        hccBackImage: z.string().optional().nullable(),
        hccBackAlt: z.string().optional().nullable(),
        hccBackCaption: z.string().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
});

const homeMarqueeSchema = z.object({
  _template: z.literal("homeMarquee"),
  hmrText: z.string(),
});

const whoScrollSchema = z.object({
  _template: z.literal("whoScroll"),
  wscShowWhoScroll: z.boolean().optional().nullable(),
  wscEyebrow: z.string(),
  wscHeading: z.string(),
  wscLedeHtml: z.string(),
  wscImage: z.string(),
  wscImageAlt: z.string(),
  wscButtonLabel: z.string(),
  wscButtonHref: z.string(),
  wscButtonExternal: z.boolean().optional().nullable(),
  wscButtonTone: z
    .enum(["primary", "outline", "surge", "ghost"])
    .optional()
    .nullable(),
});

const homeProgramsIntroSchema = z.object({
  _template: z.literal("homeProgramsIntro"),
  hpiEyebrow: z.string(),
  hpiHeading: z.string(),
  hpiLedeHtml: z.string(),
  hpiCards: z
    .array(
      z.object({
        hpiCardImage: z.string(),
        hpiCardImageAlt: z.string().optional().nullable(),
        hpiCardTitle: z.string(),
        hpiCardBodyHtml: z.string(),
        hpiCardTheme: z.enum(["buzz", "club", "surge"]).optional().nullable(),
        hpiCardTiltBaseZ: z.string().optional().nullable(),
        hpiCardButtons: z
          .array(
            z.object({
              hpcbLabel: z.string(),
              hpcbHref: z.string(),
              hpcbExternal: z.boolean().optional().nullable(),
              hpcbTone: z
                .enum(["primary", "outline", "surge", "ghost"])
                .optional()
                .nullable(),
            })
          )
          .optional()
          .nullable(),
      })
    )
    .optional()
    .nullable(),
});

const homeMeetupsSchema = z.object({
  _template: z.literal("homeMeetups"),
  hmuEyebrow: z.string(),
  hmuHeading: z.string(),
  hmuLedeHtml: z.string(),
  hmuImageLeft: z.string(),
  hmuImageLeftAlt: z.string(),
  hmuImageRight: z.string(),
  hmuImageRightAlt: z.string(),
  hmuButtonLabel: z.string(),
  hmuButtonHref: z.string(),
  hmuExternal: z.boolean().optional().nullable(),
  hmuButtonTone: z
    .enum(["primary", "outline", "surge", "ghost"])
    .optional()
    .nullable(),
});

const homeSupportBandSchema = z.object({
  _template: z.literal("homeSupportBand"),
  hsbImage: z.string(),
  hsbImageAlt: z.string(),
  hsbEyebrow: z.string(),
  hsbHeading: z.string(),
  hsbLedeHtml: z.string(),
  hsbButtonLabel: z.string(),
  hsbButtonHref: z.string(),
  hsbButtonExternal: z.boolean().optional().nullable(),
  hsbButtonTone: z
    .enum(["primary", "outline", "surge", "ghost"])
    .optional()
    .nullable(),
});

const homeMoreGridSchema = z.object({
  _template: z.literal("homeMoreGrid"),
  hmgEyebrow: z.string(),
  hmgHeading: z.string(),
  hmgLedeHtml: z.string(),
  hmgCards: z
    .array(
      z.object({
        hmgCardTitle: z.string(),
        hmgCardDescription: z.string(),
        hmgCardImage: z.string(),
        hmgCardImageAlt: z.string().optional().nullable(),
        hmgCardButtonLabel: z.string(),
        hmgCardButtonHref: z.string(),
        hmgCardExternal: z.boolean().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
});

const homeCtaBandSchema = z.object({
  _template: z.literal("homeCtaBand"),
  hcbImage: z.string(),
  hcbImageAlt: z.string(),
  hcbEyebrow: z.string(),
  hcbHeading: z.string(),
  hcbBodyHtml: z.string(),
  hcbButtons: z
    .array(
      z.object({
        hcbBtnLabel: z.string(),
        hcbBtnHref: z.string(),
        hcbBtnTone: z
          .enum(["primary", "outline", "surge", "ghost"])
          .optional()
          .nullable(),
        hcbBtnExternal: z.boolean().optional().nullable(),
      })
    )
    .optional()
    .nullable(),
});

export const pageSectionSchema = z.discriminatedUnion("_template", [
  pageIntroSchema,
  proseBandSchema,
  missionQuoteSchema,
  objectivesListSchema,
  contactSectionSchema,
  twoColumnDonateHeroSchema,
  bulletBandSchema,
  splitImageTextSchema,
  homeHeroFullSchema,
  homeMarqueeSchema,
  whoScrollSchema,
  homeProgramsIntroSchema,
  homeMeetupsSchema,
  homeSupportBandSchema,
  homeMoreGridSchema,
  homeCtaBandSchema,
]);

export const sitePageSchema = z.object({
  slug: z.string(),
  metaTitle: z.string(),
  metaDescription: z.string(),
  sections: z.array(pageSectionSchema),
});

export type PageSection = z.infer<typeof pageSectionSchema>;
export type SitePageData = z.infer<typeof sitePageSchema>;

export function parsePageSection(raw: unknown): PageSection {
  return pageSectionSchema.parse(raw);
}

export function parseSitePageData(data: unknown): SitePageData {
  return sitePageSchema.parse(data);
}

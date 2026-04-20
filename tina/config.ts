import { defineConfig } from "tinacms";

import { getTinaGitBranch } from "./branch";

const branch = getTinaGitBranch();

/** Netlify deploy dashboard (optional override). Baked into admin at `tinacms build` time. */
const netlifyDeploysUrl =
  process.env.PUBLIC_NETLIFY_DEPLOYS_URL?.trim() ||
  "https://app.netlify.com/sites/incredible-tarsier-9abffe/deploys";

const netlifySiteSlug = "incredible-tarsier-9abffe";
const tinaPreviewUrl =
  process.env.PUBLIC_TINA_PREVIEW_URL?.trim() || "";

/**
 * Section template field names must be unique across ALL templates in `sections`
 * (Tina GraphQL merges fragments; duplicate names with different nullability fail).
 */
export default defineConfig({
  branch,
  clientId: process.env.PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN || process.env.TINA_TOKEN_LOCAL,
  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public",
    },
  },
  ui: {
    previewUrl: (ctx) => {
      const b = ctx.branch?.replace(/\//g, "-") || "main";
      if (b === "main") {
        return { url: tinaPreviewUrl || "https://artify.diy" };
      }
      return {
        url: `https://${b}--${netlifySiteSlug}.netlify.app`,
      };
    },
  },
  cmsCallback: (cms) => {
    let lastDeployHint = 0;
    cms.events.subscribe(
      "alerts:add",
      (evt: { type?: string; alert?: { message?: unknown } }) => {
        if (evt?.type !== "alerts:add" || !evt.alert) return;
        const msg = String(evt.alert.message ?? "");
        if (msg !== "Document updated!" && msg !== "Document created!") return;
        const now = Date.now();
        if (now - lastDeployHint < 1500) return;
        lastDeployHint = now;
        cms.alerts.info(
          `Changes are saved to Git. Netlify is rebuilding the live site (often 1–2+ min). Deploy log: ${netlifyDeploysUrl}`,
          14_000
        );
      }
    );
    return cms;
  },
  schema: {
    collections: [
      {
        name: "program",
        label: "Programs",
        path: "src/content/programs",
        format: "mdx",
        ui: {
          description:
            "Program pages for the site (one per program). Use the live preview while editing; save sends changes to Git and the public site rebuilds in a minute or two.",
          router: ({ document }) => {
            const base = document._sys.basename.replace(/\.mdx?$/i, "");
            return `/tina-preview/programs/${base}`;
          },
        },
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "string",
            name: "description",
            label: "Short description",
            required: true,
            ui: { component: "textarea" },
          },
          {
            type: "number",
            name: "order",
            label: "Sort order (lower first)",
          },
          {
            type: "string",
            name: "progHeroLayout",
            label: "Hero image layout",
            options: [
              { label: "Single (standard banner)", value: "singleStandard" },
              { label: "Single (tall, cropped)", value: "singleTall" },
              { label: "Two images (side by side)", value: "twoStacked" },
            ],
          },
          {
            type: "object",
            name: "progHeroSlides",
            label: "Hero images",
            list: true,
            ui: {
              itemProps: () => ({ label: "Hero image" }),
            },
            fields: [
              {
                type: "image",
                name: "progHeroImage",
                label: "Image",
                required: true,
              },
              {
                type: "string",
                name: "progHeroAlt",
                label: "Alt text",
              },
            ],
          },
          {
            type: "object",
            name: "progCtaRows",
            label: "Hero buttons",
            list: true,
            ui: {
              itemProps: () => ({ label: "Button" }),
            },
            fields: [
              {
                type: "string",
                name: "progCtaLabel",
                label: "Label",
                required: true,
              },
              {
                type: "string",
                name: "progCtaHref",
                label: "Link URL",
                required: true,
              },
              {
                type: "boolean",
                name: "progCtaExternal",
                label: "Open in new tab",
              },
              {
                type: "string",
                name: "progCtaTone",
                label: "Button style",
                options: ["primary", "outline", "surge", "ghost"],
              },
            ],
          },
          {
            type: "rich-text",
            name: "body",
            label: "Page content",
            isBody: true,
            ui: {
              description:
                "Main program page copy. Use headings and paragraphs as usual; avoid pasting from Word with heavy formatting.",
            },
          },
          {
            type: "boolean",
            name: "progGalleryEnable",
            label: "Show gallery marquee",
          },
          {
            type: "string",
            name: "progGalleryHeading",
            label: "Gallery heading (h2)",
          },
          {
            type: "string",
            name: "progGalleryDekHtml",
            label: "Gallery intro (HTML, optional)",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "progGallerySurface",
            label: "Gallery section style",
            options: [
              { label: "Light (mist background)", value: "light" },
              { label: "Dark (void background)", value: "dark" },
            ],
          },
          {
            type: "string",
            name: "progGalleryMarqueeAlt",
            label: "Gallery images default alt (e.g. program name)",
          },
          {
            type: "object",
            name: "progGalleryStrip",
            label: "Gallery marquee images",
            list: true,
            ui: {
              itemProps: () => ({ label: "Marquee image" }),
            },
            fields: [
              {
                type: "image",
                name: "progGalImage",
                label: "Image",
                required: true,
              },
              {
                type: "string",
                name: "progGalAlt",
                label: "Alt override (optional)",
              },
            ],
          },
        ],
      },
      {
        name: "page",
        label: "Site pages",
        path: "src/content/pages",
        format: "json",
        ui: {
          description:
            "Each file is one page (home.json is the homepage). Build the page from Sections below—pick a block type for each, then drag to reorder. URL slug must match the filename (without .json). Live preview opens when you edit from here.",
          /**
           * Tina passes `document._sys` for routing — not top-level form fields.
           * Using `document.slug` is usually undefined here, so `/${""}` became
           * `/` and every page opened as the homepage. See:
           * https://tina.io/docs/contextual-editing/router
           */
          router: ({ document }) => {
            const sys = (
              document as {
                slug?: string;
                _sys?: {
                  filename?: string;
                  basename?: string;
                  relativePath?: string;
                };
              }
            )._sys;
            const fromSys =
              sys?.filename?.replace(/\.json$/i, "") ||
              sys?.basename?.replace(/\.json$/i, "") ||
              sys?.relativePath
                ?.replace(/^.*[/\\]/, "")
                .replace(/\.json$/i, "") ||
              "";
            const slug =
              (document as { slug?: string }).slug?.trim() || fromSys || "";
            if (slug === "home") return "/tina-preview/";
            if (!slug) return undefined;
            return `/tina-preview/${slug}`;
          },
        },
        fields: [
          {
            type: "string",
            name: "slug",
            label: "URL slug",
            required: true,
            ui: {
              description:
                "Use home for /. Others: about, donate, volunteer (must match filename without .json).",
            },
          },
          {
            type: "string",
            name: "metaTitle",
            label: "Meta title",
            ui: {
              description:
                "Shown in the browser tab and when this page is shared (Google, social). Keep it short and clear.",
            },
          },
          {
            type: "string",
            name: "metaDescription",
            label: "Meta description",
            ui: {
              component: "textarea",
              description:
                "Short summary for search results and link previews (plain text; no HTML).",
            },
          },
          {
            type: "object",
            label: "Sections",
            name: "sections",
            list: true,
            ui: {
              description:
                "Each block uses a template (e.g. Home — hero). Reorder blocks to change page order.",
            },
            templates: [
              {
                name: "pageIntro",
                label: "Page intro",
                fields: [
                  {
                    type: "string",
                    name: "introTitle",
                    label: "Heading (h1)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "introLede",
                    label: "Intro text",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "image",
                    name: "introImage",
                    label: "Image (optional)",
                  },
                  {
                    type: "string",
                    name: "introImageAlt",
                    label: "Image alt",
                  },
                ],
              },
              {
                name: "proseBand",
                label: "Prose band",
                fields: [
                  {
                    type: "string",
                    name: "pbVariant",
                    label: "Section style",
                    options: ["default", "dark"],
                  },
                  {
                    type: "image",
                    name: "pbTopImage",
                    label: "Top image (optional)",
                  },
                  {
                    type: "string",
                    name: "pbTopImageAlt",
                    label: "Top image alt",
                  },
                  {
                    type: "string",
                    name: "pbHeading",
                    label: "Heading (h2, optional)",
                  },
                  {
                    type: "string",
                    name: "pbBodyHtml",
                    label: "Body (HTML)",
                    ui: { component: "textarea" },
                  },
                ],
              },
              {
                name: "missionQuote",
                label: "Mission quote",
                fields: [
                  {
                    type: "string",
                    name: "mqQuoteText",
                    label: "Quote text",
                    ui: { component: "textarea" },
                  },
                ],
              },
              {
                name: "objectivesList",
                label: "Objectives list",
                fields: [
                  {
                    type: "string",
                    name: "objHeading",
                    label: "Heading above list",
                  },
                  {
                    type: "object",
                    name: "objLines",
                    label: "Objectives",
                    list: true,
                    ui: {
                      itemProps: () => ({ label: "List item" }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "objLineTitle",
                        label: "Bold label",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "objLineBody",
                        label: "Description",
                        ui: { component: "textarea" },
                        required: true,
                      },
                    ],
                  },
                  {
                    type: "string",
                    name: "objFooterHtml",
                    label: "Footer paragraph (HTML)",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "object",
                    name: "objCtas",
                    label: "Buttons",
                    list: true,
                    ui: {
                      description:
                        "Call-to-action buttons (label, link, style).",
                      itemProps: () => ({ label: "Button" }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "objCtaLabel",
                        label: "Button label",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "objCtaHref",
                        label: "Link URL",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "objCtaTone",
                        label: "Button style",
                        options: [
                          { label: "Primary", value: "primary" },
                          { label: "Outline", value: "outline" },
                          { label: "Surge", value: "surge" },
                          { label: "Ghost", value: "ghost" },
                        ],
                      },
                      {
                        type: "boolean",
                        name: "objCtaExternal",
                        label: "Open in new tab (external link)",
                      },
                    ],
                  },
                ],
              },
              {
                name: "contactSection",
                label: "Contact section",
                fields: [
                  {
                    type: "string",
                    name: "ctHeading",
                    label: "Heading (h2)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "ctSubheading",
                    label: "Subheading (e.g. venue name)",
                  },
                  {
                    type: "string",
                    name: "ctAddressHtml",
                    label: "Address (HTML)",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "string",
                    name: "ctNoteHtml",
                    label: "Note (HTML)",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "string",
                    name: "ctEmail",
                    label: "Email",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "ctPhoneDisplay",
                    label: "Phone (display)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "ctPhoneTel",
                    label: "Phone (tel: href, digits/+)",
                    required: true,
                  },
                ],
              },
              {
                name: "twoColumnDonateHero",
                label: "Two-column hero (donate-style)",
                fields: [
                  {
                    type: "string",
                    name: "dchTitle",
                    label: "Heading (h1)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "dchLede",
                    label: "Intro text",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "string",
                    name: "dchButtonLabel",
                    label: "Button label",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "dchButtonHref",
                    label: "Button URL",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "dchButtonTone",
                    label: "Button style",
                    options: [
                      { label: "Primary", value: "primary" },
                      { label: "Outline", value: "outline" },
                      { label: "Surge", value: "surge" },
                      { label: "Ghost", value: "ghost" },
                    ],
                  },
                  {
                    type: "boolean",
                    name: "dchExternal",
                    label: "Open in new tab",
                  },
                  {
                    type: "image",
                    name: "dchImage",
                    label: "Side image",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "dchImageAlt",
                    label: "Image alt text",
                    required: true,
                  },
                ],
              },
              {
                name: "bulletBand",
                label: "Bullet list band",
                fields: [
                  {
                    type: "string",
                    name: "bbVariant",
                    label: "Section style",
                    options: [
                      { label: "Light", value: "default" },
                      { label: "Dark", value: "dark" },
                    ],
                  },
                  {
                    type: "string",
                    name: "bbHeading",
                    label: "Heading (h2)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "bbLines",
                    label: "List items",
                    list: true,
                  },
                ],
              },
              {
                name: "splitImageText",
                label: "Split image + text",
                fields: [
                  {
                    type: "string",
                    name: "sitVariant",
                    label: "Section style",
                    options: [
                      { label: "Light", value: "default" },
                      { label: "Dark", value: "dark" },
                    ],
                  },
                  {
                    type: "string",
                    name: "sitHeading",
                    label: "Heading (h2)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "sitBody",
                    label: "Body (HTML)",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "string",
                    name: "sitButtonLabel",
                    label: "Button label (optional)",
                  },
                  {
                    type: "string",
                    name: "sitButtonHref",
                    label: "Button URL (optional)",
                  },
                  {
                    type: "string",
                    name: "sitButtonTone",
                    label: "Button style",
                    options: [
                      { label: "Primary", value: "primary" },
                      { label: "Outline", value: "outline" },
                      { label: "Surge", value: "surge" },
                      { label: "Ghost", value: "ghost" },
                    ],
                  },
                  {
                    type: "boolean",
                    name: "sitExternal",
                    label: "Open button in new tab",
                  },
                  {
                    type: "image",
                    name: "sitImage",
                    label: "Image",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "sitImageAlt",
                    label: "Image alt text",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "sitImagePosition",
                    label: "Image column",
                    options: [
                      { label: "Left", value: "left" },
                      { label: "Right", value: "right" },
                    ],
                  },
                ],
              },
              {
                name: "homeHeroFull",
                label: "Home — top section (headline, buttons, collage, feature card)",
                fields: [
                  {
                    type: "string",
                    name: "hhfEyebrow",
                    label: "Small line above headline",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hhfTitle",
                    label: "Main headline",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hhfLede",
                    label: "Supporting paragraph (short)",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hhfRotatorWords",
                    label: "Rotating words/phrases (optional)",
                    list: true,
                    ui: {
                      description:
                        "Optional: short phrases that cycle under the headline (one per line).",
                    },
                  },
                  {
                    type: "object",
                    name: "hhfHeroButtons",
                    label: "Buttons under the headline",
                    list: true,
                    ui: {
                      description:
                        "Primary calls to action below the hero copy (0–4 buttons).",
                      itemProps: () => ({ label: "Button" }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "hhbLabel",
                        label: "Button text",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "hhbHref",
                        label: "Link",
                        required: true,
                      },
                      {
                        type: "boolean",
                        name: "hhbExternal",
                        label: "Open in a new tab",
                      },
                      {
                        type: "string",
                        name: "hhbTone",
                        label: "Button style (look)",
                        options: [
                          { label: "Primary", value: "primary" },
                          { label: "Outline", value: "outline" },
                          { label: "Surge", value: "surge" },
                          { label: "Ghost", value: "ghost" },
                        ],
                      },
                    ],
                  },
                  {
                    type: "string",
                    name: "hhfAsideBadge",
                    label: "Feature card — badge",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hhfAsideTitle",
                    label: "Feature card — title",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hhfAsideDescription",
                    label: "Feature card — description",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hhfAsideMeetupsLabel",
                    label: "Feature card — main button text",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hhfAsideMeetupsHref",
                    label: "Feature card — main button link",
                    required: true,
                  },
                  {
                    type: "boolean",
                    name: "hhfAsideMeetupsExternal",
                    label: "Feature card — main button opens new tab",
                  },
                  {
                    type: "string",
                    name: "hhfAsideMeetupsTone",
                    label: "Feature card — main button style",
                    options: [
                      { label: "Primary", value: "primary" },
                      { label: "Outline", value: "outline" },
                      { label: "Surge", value: "surge" },
                      { label: "Ghost", value: "ghost" },
                    ],
                  },
                  {
                    type: "object",
                    name: "hhfAsideStackButtons",
                    label: "Feature card — extra buttons",
                    list: true,
                    ui: {
                      description:
                        "Extra buttons shown under the main button (optional).",
                      itemProps: () => ({ label: "Button" }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "habsLabel",
                        label: "Button text",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "habsHref",
                        label: "Link",
                        required: true,
                      },
                      {
                        type: "boolean",
                        name: "habsExternal",
                        label: "Open in a new tab",
                      },
                      {
                        type: "string",
                        name: "habsTone",
                        label: "Button style (look)",
                        options: [
                          { label: "Primary", value: "primary" },
                          { label: "Outline", value: "outline" },
                          { label: "Surge", value: "surge" },
                          { label: "Ghost", value: "ghost" },
                        ],
                      },
                    ],
                  },
                  {
                    type: "image",
                    name: "hhfHiringImage",
                    label: "Right-side poster image",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hhfHiringImageAlt",
                    label: "Right-side poster — short description",
                    required: true,
                  },
                  {
                    type: "boolean",
                    name: "hhfShowCollage",
                    label:
                      "Show playful 3D collage (between hero copy and aside column)",
                    ui: {
                      description:
                        "Turn this off to hide the animated photo cards entirely. When it is on, use “Collage flip-cards” below to change the photos and short lines of text.",
                    },
                  },
                  {
                    type: "object",
                    name: "hhfCollageCards",
                    label: "Collage flip-cards",
                    list: true,
                    ui: {
                      description:
                        "Four animated cards on the home hero (fixed spots on the page). Each card has two sides: Side A is what people see first; Side B appears when the card flips. Tip: while editing the live preview, click the collage once to jump to this hero section in the sidebar.",
                      max: 4,
                      itemProps: () => ({
                        label: "Collage card",
                      }),
                    },
                    fields: [
                      {
                        type: "image",
                        name: "hccFrontImage",
                        label: "Side A — photo",
                        ui: {
                          description:
                            "Shown on the front of the card first. Pick a clear, bright photo; it will be cropped to fit the card.",
                        },
                      },
                      {
                        type: "string",
                        name: "hccFrontAlt",
                        label: "Side A — short description for screen readers",
                        ui: {
                          description:
                            "Describe what is in the Side A photo (under 80 characters). Helps visitors who use assistive technology.",
                          validate: (val: string | undefined) =>
                            val && val.length > 80
                              ? "Keep this under 80 characters"
                              : undefined,
                        },
                      },
                      {
                        type: "string",
                        name: "hccFrontCaption",
                        label: "Side A — line under the photo",
                        ui: {
                          description:
                            "A very short phrase under the photo (30 characters max so the card layout stays tidy).",
                          validate: (val: string | undefined) =>
                            val && val.length > 30
                              ? "Use 30 characters or fewer so the card still looks good"
                              : undefined,
                        },
                      },
                      {
                        type: "image",
                        name: "hccBackImage",
                        label: "Side B — photo (after the card flips)",
                        ui: {
                          description:
                            "Shown when the card flips. Same tips as Side A — clear subject, will be cropped.",
                        },
                      },
                      {
                        type: "string",
                        name: "hccBackAlt",
                        label: "Side B — short description for screen readers",
                        ui: {
                          description:
                            "Describe the Side B photo (under 80 characters).",
                          validate: (val: string | undefined) =>
                            val && val.length > 80
                              ? "Keep this under 80 characters"
                              : undefined,
                        },
                      },
                      {
                        type: "string",
                        name: "hccBackCaption",
                        label: "Side B — line under the photo",
                        ui: {
                          description:
                            "Short phrase for the flipped side (30 characters max).",
                          validate: (val: string | undefined) =>
                            val && val.length > 30
                              ? "Use 30 characters or fewer so the card still looks good"
                              : undefined,
                        },
                      },
                    ],
                  },
                ],
              },
              {
                name: "homeMarquee",
                label: "Home — marquee strip",
                fields: [
                  {
                    type: "string",
                    name: "hmrText",
                    label: "Scrolling text",
                    ui: { component: "textarea" },
                    required: true,
                  },
                ],
              },
              {
                name: "whoScroll",
                label: "Home — Who we are scroll",
                fields: [
                  {
                    type: "boolean",
                    name: "wscShowWhoScroll",
                    label: "Show this section",
                  },
                  {
                    type: "string",
                    name: "wscEyebrow",
                    label: "Eyebrow (small caps line)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "wscHeading",
                    label: "Heading",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "wscLedeHtml",
                    label: "Body copy (HTML)",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "image",
                    name: "wscImage",
                    label: "Background image (arch)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "wscImageAlt",
                    label: "Background image alt text",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "wscButtonLabel",
                    label: "Button label",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "wscButtonHref",
                    label: "Button URL",
                    required: true,
                  },
                  {
                    type: "boolean",
                    name: "wscButtonExternal",
                    label: "Button opens in new tab",
                  },
                  {
                    type: "string",
                    name: "wscButtonTone",
                    label: "Button style",
                    options: [
                      { label: "Primary", value: "primary" },
                      { label: "Outline", value: "outline" },
                      { label: "Surge", value: "surge" },
                      { label: "Ghost", value: "ghost" },
                    ],
                  },
                ],
              },
              {
                name: "homeProgramsIntro",
                label: "Home — programs intro (before cards)",
                fields: [
                  {
                    type: "string",
                    name: "hpiEyebrow",
                    label: "Eyebrow",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hpiHeading",
                    label: "Heading (h2)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hpiLedeHtml",
                    label: "Lede (HTML)",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "object",
                    name: "hpiCards",
                    label: "Program cards",
                    list: true,
                    ui: {
                      description:
                        "Three program feature cards (images, copy, buttons).",
                      itemProps: () => ({ label: "Card" }),
                    },
                    fields: [
                      {
                        type: "image",
                        name: "hpiCardImage",
                        label: "Card image",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "hpiCardImageAlt",
                        label: "Image alt text",
                      },
                      {
                        type: "string",
                        name: "hpiCardTitle",
                        label: "Card title",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "hpiCardBodyHtml",
                        label: "Description (HTML)",
                        ui: { component: "textarea" },
                        required: true,
                      },
                      {
                        type: "string",
                        name: "hpiCardTheme",
                        label: "Card accent theme",
                        options: [
                          { label: "Buzz (lavender)", value: "buzz" },
                          { label: "Club (purple)", value: "club" },
                          { label: "Surge (violet)", value: "surge" },
                        ],
                      },
                      {
                        type: "string",
                        name: "hpiCardTiltBaseZ",
                        label: "Tilt depth (optional, e.g. -1, 1, -0.5)",
                      },
                      {
                        type: "object",
                        name: "hpiCardButtons",
                        label: "Buttons",
                        list: true,
                        ui: {
                          description: "Up to four buttons per card.",
                          itemProps: () => ({ label: "Button" }),
                        },
                        fields: [
                          {
                            type: "string",
                            name: "hpcbLabel",
                            label: "Label",
                            required: true,
                          },
                          {
                            type: "string",
                            name: "hpcbHref",
                            label: "Link URL",
                            required: true,
                          },
                          {
                            type: "boolean",
                            name: "hpcbExternal",
                            label: "Open in new tab",
                          },
                          {
                            type: "string",
                            name: "hpcbTone",
                            label: "Button style",
                            options: [
                              { label: "Primary", value: "primary" },
                              { label: "Outline", value: "outline" },
                              { label: "Surge", value: "surge" },
                              { label: "Ghost", value: "ghost" },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                name: "homeMeetups",
                label: "Home — events spotlight (time/place + photos)",
                fields: [
                  {
                    type: "string",
                    name: "hmuEyebrow",
                    label: "Eyebrow",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hmuHeading",
                    label: "Heading (h2)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hmuLedeHtml",
                    label: "Body (HTML)",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "image",
                    name: "hmuImageLeft",
                    label: "Left image",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hmuImageLeftAlt",
                    label: "Left image alt text",
                    required: true,
                  },
                  {
                    type: "image",
                    name: "hmuImageRight",
                    label: "Right image",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hmuImageRightAlt",
                    label: "Right image alt text",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hmuButtonLabel",
                    label: "Button label",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hmuButtonHref",
                    label: "Button URL",
                    required: true,
                  },
                  {
                    type: "boolean",
                    name: "hmuExternal",
                    label: "Button opens in new tab",
                  },
                  {
                    type: "string",
                    name: "hmuButtonTone",
                    label: "Button style",
                    options: [
                      { label: "Primary", value: "primary" },
                      { label: "Outline", value: "outline" },
                      { label: "Surge", value: "surge" },
                      { label: "Ghost", value: "ghost" },
                    ],
                  },
                ],
              },
              {
                name: "homeSupportBand",
                label: "Home — why support",
                fields: [
                  {
                    type: "image",
                    name: "hsbImage",
                    label: "Image",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hsbImageAlt",
                    label: "Image alt text",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hsbEyebrow",
                    label: "Eyebrow",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hsbHeading",
                    label: "Heading (h2)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hsbLedeHtml",
                    label: "Body (HTML)",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hsbButtonLabel",
                    label: "Button label",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hsbButtonHref",
                    label: "Button URL",
                    required: true,
                  },
                  {
                    type: "boolean",
                    name: "hsbButtonExternal",
                    label: "Button opens in new tab",
                  },
                  {
                    type: "string",
                    name: "hsbButtonTone",
                    label: "Button style",
                    options: [
                      { label: "Primary", value: "primary" },
                      { label: "Outline", value: "outline" },
                      { label: "Surge", value: "surge" },
                      { label: "Ghost", value: "ghost" },
                    ],
                  },
                ],
              },
              {
                name: "homeMoreGrid",
                label: "Home — more ways grid",
                fields: [
                  {
                    type: "string",
                    name: "hmgEyebrow",
                    label: "Eyebrow",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hmgHeading",
                    label: "Heading (h2)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hmgLedeHtml",
                    label: "Lede (HTML)",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "object",
                    name: "hmgCards",
                    label: "Cards",
                    list: true,
                    ui: {
                      itemProps: () => ({ label: "Card" }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "hmgCardTitle",
                        label: "Title",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "hmgCardDescription",
                        label: "Description",
                        ui: { component: "textarea" },
                        required: true,
                      },
                      {
                        type: "image",
                        name: "hmgCardImage",
                        label: "Image",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "hmgCardImageAlt",
                        label: "Image alt text",
                      },
                      {
                        type: "string",
                        name: "hmgCardButtonLabel",
                        label: "Button label",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "hmgCardButtonHref",
                        label: "Button URL",
                        required: true,
                      },
                      {
                        type: "boolean",
                        name: "hmgCardExternal",
                        label: "Button opens in new tab",
                      },
                    ],
                  },
                ],
              },
              {
                name: "homeCtaBand",
                label: "Home — bottom CTA band",
                fields: [
                  {
                    type: "image",
                    name: "hcbImage",
                    label: "Side image",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hcbImageAlt",
                    label: "Image alt text",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hcbEyebrow",
                    label: "Eyebrow",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hcbHeading",
                    label: "Heading (h2)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "hcbBodyHtml",
                    label: "Body (HTML)",
                    ui: { component: "textarea" },
                    required: true,
                  },
                  {
                    type: "object",
                    name: "hcbButtons",
                    label: "Buttons",
                    list: true,
                    ui: {
                      itemProps: () => ({ label: "Button" }),
                    },
                    fields: [
                      {
                        type: "string",
                        name: "hcbBtnLabel",
                        label: "Label",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "hcbBtnHref",
                        label: "Link URL",
                        required: true,
                      },
                      {
                        type: "string",
                        name: "hcbBtnTone",
                        label: "Button style",
                        options: [
                          { label: "Primary", value: "primary" },
                          { label: "Outline", value: "outline" },
                          { label: "Surge", value: "surge" },
                          { label: "Ghost", value: "ghost" },
                        ],
                      },
                      {
                        type: "boolean",
                        name: "hcbBtnExternal",
                        label: "Open in new tab",
                      },
                    ],
                  },
                ],
              },
              {
                name: "eventsGallery",
                label: "Events — image links (full-width tiles)",
                fields: [
                  {
                    type: "string",
                    name: "evgHeading",
                    label: "Page heading (h1)",
                    required: true,
                  },
                  {
                    type: "string",
                    name: "evgLedeHtml",
                    label: "Intro text (optional, HTML)",
                    ui: {
                      component: "textarea",
                      description:
                        "Optional short intro above the event images. Keep it brief.",
                    },
                  },
                  {
                    type: "object",
                    name: "evgTiles",
                    label: "Event tiles",
                    list: true,
                    ui: {
                      description:
                        "Each tile is a full-width image that links out (e.g. to a Facebook event). Expired tiles are hidden automatically after the expiration date/time.",
                      itemProps: () => ({ label: "Event tile" }),
                    },
                    fields: [
                      {
                        type: "image",
                        name: "evtImage",
                        label: "Image",
                        required: true,
                        ui: {
                          description:
                            "Recommendation: upload under /images/events/ for consistency (not required).",
                        },
                      },
                      {
                        type: "string",
                        name: "evtAlt",
                        label: "Image description (for screen readers)",
                        ui: {
                          description:
                            "Short description of the image content (recommended).",
                        },
                      },
                      {
                        type: "datetime",
                        name: "evtDate",
                        label: "Event date/time",
                        required: true,
                        ui: {
                          description:
                            "Used to automatically group events by month and year on the Events page.",
                        },
                      },
                      {
                        type: "string",
                        name: "evtHref",
                        label: "Link (Facebook event URL)",
                        ui: {
                          description:
                            "Optional: paste the Facebook event link for this image. If blank, the image still shows but won’t link out.",
                          validate: (val: string | undefined) => {
                            if (!val) return undefined;
                            try {
                              const u = new URL(val);
                              if (u.protocol !== "https:" && u.protocol !== "http:") {
                                return "Link must start with http:// or https://";
                              }
                              return undefined;
                            } catch {
                              return "Please enter a valid URL";
                            }
                          },
                        },
                      },
                      {
                        type: "datetime",
                        name: "evtExpiresAt",
                        label: "Expiration date/time (optional)",
                        ui: {
                          description:
                            "After this moment, the tile is hidden from the Events page. Leave blank to keep it indefinitely.",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        name: "equipmentWishlist",
        label: "Equipment wish list",
        path: "src/content/equipment",
        format: "json",
        match: {
          include: "wishlist",
        },
        ui: {
          description:
            "One wish list document (categories and plain-text lines). No live preview—save and check the equipment page on the site after deploy.",
        },
        fields: [
          {
            type: "object",
            name: "categories",
            label: "Categories",
            list: true,
            ui: {
              itemProps: () => ({ label: "Category" }),
            },
            fields: [
              {
                type: "string",
                name: "eqCatId",
                required: true,
                isTitle: true,
              },
              { type: "string", name: "eqCatTitle", required: true },
              {
                type: "string",
                name: "eqCatLines",
                label: "Items",
                list: true,
              },
            ],
          },
        ],
      },
      {
        name: "siteChrome",
        label: "𝗦𝗶𝘁𝗲 𝘀𝗲𝘁𝘁𝗶𝗻𝗴𝘀",
        path: "src/content/site",
        format: "json",
        match: {
          include: "chrome",
        },
        ui: {
          description:
            "Global header, wheel menu, and footer (chrome.json). Edit in the form below—no live preview. For logos: upload in Tina Media, then paste the public path (e.g. /images/your-logo.png).",
        },
        fields: [
          {
            type: "string",
            name: "headerLogoImage",
            label: "Header logo — image path",
            ui: {
              description:
                "Light top bar logo. Example: /images/logo-on-light-hollow.png (upload via Media, then paste path). Leave empty for default.",
            },
          },
          {
            type: "string",
            name: "footerLogoImage",
            label: "Footer logo — image path",
            ui: {
              description:
                "Dark footer wordmark. Example: /images/logo-on-dark-full.png. Leave empty for default.",
            },
          },
          {
            type: "string",
            name: "headerLogoAriaLabel",
            label: "Logo link — accessible name (header & footer)",
            isTitle: true,
            required: true,
          },
          {
            type: "object",
            name: "navItems",
            label: "Wheel menu links",
            list: true,
            ui: {
              description:
                "Add, remove, or reorder. Order matches the arc: left → top → right on desktop; stacked on small screens.",
              itemProps: () => ({ label: "Menu link" }),
            },
            fields: [
              {
                type: "string",
                name: "href",
                label: "URL path or full URL",
                required: true,
              },
              {
                type: "string",
                name: "label",
                label: "Short label (shown on the wheel)",
                required: true,
              },
              {
                type: "string",
                name: "ariaLabel",
                label: "Accessible name (optional; defaults to label)",
                ui: { component: "textarea" },
              },
              {
                type: "boolean",
                name: "external",
                label: "External link (new tab)",
              },
            ],
          },
          {
            type: "string",
            name: "islandHomeAriaLabel",
            label: "Bottom island — Home button accessible name",
          },
          {
            type: "string",
            name: "islandMenuOpenText",
            label: "Bottom island — Menu button text (closed)",
          },
          {
            type: "string",
            name: "islandMenuCloseText",
            label: "Bottom island — Menu button text (open)",
          },
          {
            type: "string",
            name: "footerTagline",
            label: "Footer — tagline under logo",
            ui: { component: "textarea" },
          },
          {
            type: "string",
            name: "footerConnectHeading",
            label: "Footer — Connect column heading",
          },
          {
            type: "string",
            name: "footerCommunityHeading",
            label: "Footer — Community column heading",
          },
          {
            type: "string",
            name: "footerEmail",
            label: "Footer — email address",
          },
          {
            type: "string",
            name: "footerPhoneDisplay",
            label: "Footer — phone (display text)",
          },
          {
            type: "string",
            name: "footerPhoneTel",
            label: "Footer — phone (tel: value, e.g. +13522995673)",
          },
          {
            type: "string",
            name: "instagramUrl",
            label: "Footer — Instagram URL",
          },
          {
            type: "string",
            name: "instagramLabel",
            label: "Footer — Instagram link text",
          },
          {
            type: "string",
            name: "facebookUrl",
            label: "Footer — Facebook URL",
          },
          {
            type: "string",
            name: "facebookLabel",
            label: "Footer — Facebook link text",
          },
          {
            type: "string",
            name: "meetupUrl",
            label: "Footer — community meetup URL",
          },
          {
            type: "string",
            name: "meetupLabel",
            label: "Footer — community meetup link text",
          },
          {
            type: "string",
            name: "meetupAriaLabel",
            label: "Footer — community meetup accessible name",
          },
          {
            type: "string",
            name: "footerCopyright",
            label: "Footer — copyright line",
            ui: {
              description: "Use {{year}} for the current year.",
            },
          },
        ],
      },
    ],
  },
});

import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { siteChromeSchema } from "./lib/site-chrome";

const progHeroSlide = z.object({
  progHeroImage: z.string(),
  progHeroAlt: z.string().optional(),
});

const progCtaRow = z.object({
  progCtaLabel: z.string(),
  progCtaHref: z.string(),
  progCtaExternal: z.boolean().optional(),
  progCtaTone: z.enum(["primary", "outline", "surge", "ghost"]).optional(),
});

const progGallerySlide = z.object({
  progGalImage: z.string(),
  progGalAlt: z.string().optional(),
});

const programs = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/programs" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().optional(),
    progHeroLayout: z
      .enum(["singleStandard", "singleTall", "twoStacked"])
      .optional(),
    progHeroSlides: z.array(progHeroSlide).optional(),
    progCtaRows: z.array(progCtaRow).optional(),
    progGalleryEnable: z.boolean().optional(),
    progGalleryHeading: z.string().optional(),
    progGalleryDekHtml: z.string().optional(),
    progGallerySurface: z.enum(["light", "dark"]).optional(),
    progGalleryMarqueeAlt: z.string().optional(),
    progGalleryStrip: z.array(progGallerySlide).optional(),
  }),
});

type EquipmentCategory = {
  eqCatId: string;
  eqCatTitle: string;
  eqCatLines: string[];
};

const equipment = defineCollection({
  loader: async () => {
    const wishlistPath = path.join(
      process.cwd(),
      "src/content/equipment/wishlist.json",
    );
    const raw = JSON.parse(await readFile(wishlistPath, "utf-8")) as {
      categories: EquipmentCategory[];
    };
    return raw.categories.map((c) => ({
      id: c.eqCatId,
      title: c.eqCatTitle,
      items: c.eqCatLines,
    }));
  },
  schema: z.object({
    title: z.string(),
    items: z.array(z.string()),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/pages" }),
  schema: z.object({
    slug: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    sections: z.array(z.any()),
  }),
});

const siteChrome = defineCollection({
  loader: glob({ pattern: "chrome.json", base: "./src/content/site" }),
  schema: siteChromeSchema,
});

export const collections = {
  programs,
  equipment,
  pages,
  siteChrome,
};

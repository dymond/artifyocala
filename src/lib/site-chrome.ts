import { z } from "zod";
import { img } from "./site-images";

export const siteChromeSchema = z.object({
  /** Public URL path to header logo (light background), e.g. /images/logo-on-light-hollow.png */
  headerLogoImage: z.string().optional(),
  /** Public URL path to footer logo (dark background), e.g. /images/logo-on-dark-full.png */
  footerLogoImage: z.string().optional(),
  navItems: z.array(
    z.object({
      href: z.string(),
      label: z.string(),
      ariaLabel: z.string().optional(),
      external: z.boolean().optional(),
    }),
  ),
  headerLogoAriaLabel: z.string(),
  islandHomeAriaLabel: z.string(),
  islandMenuOpenText: z.string(),
  islandMenuCloseText: z.string(),
  footerTagline: z.string(),
  footerConnectHeading: z.string(),
  footerCommunityHeading: z.string(),
  footerEmail: z.string(),
  footerPhoneDisplay: z.string(),
  footerPhoneTel: z.string(),
  instagramUrl: z.string(),
  instagramLabel: z.string(),
  facebookUrl: z.string(),
  facebookLabel: z.string(),
  meetupUrl: z.string(),
  meetupLabel: z.string(),
  meetupAriaLabel: z.string(),
  footerCopyright: z.string(),
});

export type SiteChrome = z.infer<typeof siteChromeSchema>;

/** Tina / public paths: ensure a root-relative URL for <img src>. */
function publicImageSrc(raw: string): string {
  const v = raw.trim();
  if (!v) return v;
  if (v.startsWith("http://") || v.startsWith("https://")) return v;
  return v.startsWith("/") ? v : `/${v}`;
}

export function headerLogoSrc(chrome: SiteChrome): string {
  const v = chrome.headerLogoImage?.trim();
  return v ? publicImageSrc(v) : img.logoOnLightHollow;
}

export function footerLogoSrc(chrome: SiteChrome): string {
  const v = chrome.footerLogoImage?.trim();
  return v ? publicImageSrc(v) : img.logoOnDarkFull;
}

/** Replace `{{year}}` in copyright template. */
export function formatCopyright(template: string, year = new Date().getFullYear()): string {
  return template.replace(/\{\{\s*year\s*\}\}/gi, String(year));
}

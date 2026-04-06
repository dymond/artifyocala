import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  footerLogoSrc,
  formatCopyright,
  headerLogoSrc,
  siteChromeSchema,
} from "../../src/lib/site-chrome";
import { img } from "../../src/lib/site-images";

describe("site settings (chrome.json)", () => {
  it("parses src/content/site/chrome.json", async () => {
    const raw = await readFile(
      path.join(process.cwd(), "src/content/site/chrome.json"),
      "utf-8",
    );
    const parsed = siteChromeSchema.parse(JSON.parse(raw));
    expect(parsed.navItems.length).toBeGreaterThan(0);
    expect(parsed.headerLogoAriaLabel.length).toBeGreaterThan(0);
  });

  it("formatCopyright replaces year token", () => {
    expect(formatCopyright("© {{year}} X", 2030)).toBe("© 2030 X");
  });

  it("resolves logo paths with defaults and leading slash", () => {
    const base = siteChromeSchema.parse(
      JSON.parse(
        '{"navItems":[],"headerLogoAriaLabel":"x","islandHomeAriaLabel":"x","islandMenuOpenText":"x","islandMenuCloseText":"x","footerTagline":"x","footerConnectHeading":"x","footerCommunityHeading":"x","footerEmail":"a@b.co","footerPhoneDisplay":"1","footerPhoneTel":"+11","instagramUrl":"https://i.co","instagramLabel":"i","facebookUrl":"https://f.co","facebookLabel":"f","meetupUrl":"https://m.co","meetupLabel":"m","meetupAriaLabel":"m","footerCopyright":"{{year}}"}',
      ),
    );
    expect(headerLogoSrc(base)).toBe(img.logoOnLightHollow);
    expect(footerLogoSrc(base)).toBe(img.logoOnDarkFull);
    const withPaths = { ...base, headerLogoImage: "images/a.png", footerLogoImage: "/images/b.png" };
    expect(headerLogoSrc(withPaths)).toBe("/images/a.png");
    expect(footerLogoSrc(withPaths)).toBe("/images/b.png");
  });
});

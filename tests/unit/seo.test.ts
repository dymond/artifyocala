import { describe, expect, it } from "vitest";
import {
  absoluteUrl,
  breadcrumbListJsonLd,
  DEFAULT_SITE_DESCRIPTION,
  programArticleJsonLd,
  resolvePageDescription,
} from "../../src/lib/seo";

describe("resolvePageDescription", () => {
  it("uses default for empty or whitespace", () => {
    expect(resolvePageDescription("")).toBe(DEFAULT_SITE_DESCRIPTION);
    expect(resolvePageDescription("   ")).toBe(DEFAULT_SITE_DESCRIPTION);
    expect(resolvePageDescription(undefined)).toBe(DEFAULT_SITE_DESCRIPTION);
  });

  it("trims and keeps non-empty copy", () => {
    expect(resolvePageDescription("  Hello  ")).toBe("Hello");
  });
});

const siteOrigin = "https://www.artifyocala.org";

describe("absoluteUrl", () => {
  it("joins origin and root-relative paths", () => {
    expect(absoluteUrl(siteOrigin, "/programs/foo")).toBe(
      "https://www.artifyocala.org/programs/foo"
    );
    expect(absoluteUrl(siteOrigin, "programs/foo")).toBe(
      "https://www.artifyocala.org/programs/foo"
    );
  });

  it("passes through absolute URLs", () => {
    expect(
      absoluteUrl(siteOrigin, "https://cdn.example.com/x.jpg")
    ).toBe("https://cdn.example.com/x.jpg");
  });
});

describe("breadcrumbListJsonLd", () => {
  it("builds ListItem entries with positions", () => {
    const j = breadcrumbListJsonLd(siteOrigin, [
      { name: "Home", path: "/" },
      { name: "Programs", path: "/programs/x" },
    ]);
    expect(j["@type"]).toBe("BreadcrumbList");
    const items = j.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      position: 1,
      name: "Home",
      item: "https://www.artifyocala.org/",
    });
    expect(items[1]).toMatchObject({
      position: 2,
      name: "Programs",
      item: "https://www.artifyocala.org/programs/x",
    });
  });
});

describe("programArticleJsonLd", () => {
  it("includes headline and optional image", () => {
    const a = programArticleJsonLd({
      siteOrigin,
      pageUrl: "https://www.artifyocala.org/programs/maker-collective",
      headline: "Maker Collective",
      description: "A makerspace.",
      imageUrl: "https://www.artifyocala.org/images/hero.png",
    });
    expect(a["@type"]).toBe("Article");
    expect(a.headline).toBe("Maker Collective");
    expect(a.image).toBe("https://www.artifyocala.org/images/hero.png");
  });
});

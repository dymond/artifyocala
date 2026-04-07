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

describe("absoluteUrl", () => {
  it("joins origin and root-relative paths", () => {
    expect(absoluteUrl("https://artify.diy", "/programs/foo")).toBe(
      "https://artify.diy/programs/foo"
    );
    expect(absoluteUrl("https://artify.diy", "programs/foo")).toBe(
      "https://artify.diy/programs/foo"
    );
  });

  it("passes through absolute URLs", () => {
    expect(
      absoluteUrl("https://artify.diy", "https://cdn.example.com/x.jpg")
    ).toBe("https://cdn.example.com/x.jpg");
  });
});

describe("breadcrumbListJsonLd", () => {
  it("builds ListItem entries with positions", () => {
    const j = breadcrumbListJsonLd("https://artify.diy", [
      { name: "Home", path: "/" },
      { name: "Programs", path: "/programs/x" },
    ]);
    expect(j["@type"]).toBe("BreadcrumbList");
    const items = j.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      position: 1,
      name: "Home",
      item: "https://artify.diy/",
    });
    expect(items[1]).toMatchObject({
      position: 2,
      name: "Programs",
      item: "https://artify.diy/programs/x",
    });
  });
});

describe("programArticleJsonLd", () => {
  it("includes headline and optional image", () => {
    const a = programArticleJsonLd({
      siteOrigin: "https://artify.diy",
      pageUrl: "https://artify.diy/programs/maker-collective",
      headline: "Maker Collective",
      description: "A makerspace.",
      imageUrl: "https://artify.diy/images/hero.png",
    });
    expect(a["@type"]).toBe("Article");
    expect(a.headline).toBe("Maker Collective");
    expect(a.image).toBe("https://artify.diy/images/hero.png");
  });
});

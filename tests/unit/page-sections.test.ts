import { describe, expect, it } from "vitest";
import {
  getSectionTemplateKey,
  isKnownSectionTemplate,
  KNOWN_SECTION_TEMPLATES,
} from "../../src/lib/page-sections/registry";
import { parsePageSection, parseSitePageData } from "../../src/lib/page-sections/schema";
import aboutJson from "../../src/content/pages/about.json";
import homeJson from "../../src/content/pages/home.json";

describe("page section registry", () => {
  it("lists stable template keys", () => {
    expect(KNOWN_SECTION_TEMPLATES).toContain("pageIntro");
    expect(KNOWN_SECTION_TEMPLATES).toContain("homeHeroFull");
    expect(KNOWN_SECTION_TEMPLATES.length).toBeGreaterThanOrEqual(16);
  });

  it("getSectionTemplateKey reads _template", () => {
    expect(getSectionTemplateKey({ _template: "bulletBand" })).toBe("bulletBand");
  });

  it("rejects unknown templates", () => {
    expect(() => getSectionTemplateKey({ _template: "nope" })).toThrow(
      /Unknown section template/,
    );
  });

  it("isKnownSectionTemplate narrows", () => {
    expect(isKnownSectionTemplate("pageIntro")).toBe(true);
    expect(isKnownSectionTemplate("fake")).toBe(false);
  });
});

describe("page section schema", () => {
  it("parses about.json sections", () => {
    const page = parseSitePageData(aboutJson);
    expect(page.slug).toBe("about");
    for (const s of page.sections) {
      expect(() => parsePageSection(s)).not.toThrow();
    }
  });

  it("parses home.json sections", () => {
    const page = parseSitePageData(homeJson);
    expect(page.slug).toBe("home");
    for (const s of page.sections) {
      expect(() => parsePageSection(s)).not.toThrow();
    }
  });

  it("parses a bulletBand section", () => {
    const s = parsePageSection({
      _template: "bulletBand",
      bbVariant: "dark",
      bbHeading: "Where it goes",
      bbLines: ["A", "B"],
    });
    expect(s._template).toBe("bulletBand");
    if (s._template === "bulletBand") {
      expect(s.bbLines).toEqual(["A", "B"]);
    }
  });

  it("allows optional split CTAs", () => {
    const s = parsePageSection({
      _template: "splitImageText",
      sitHeading: "Why",
      sitBody: "Body",
      sitImage: "/x.jpg",
      sitImageAlt: "",
      sitImagePosition: "left",
    });
    expect(s._template).toBe("splitImageText");
    if (s._template === "splitImageText") {
      expect(s.sitButtonLabel).toBeUndefined();
    }
  });
});

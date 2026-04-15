import { describe, expect, it } from "vitest";
import { normalizeTinaRepoMediaSrc } from "../../src/lib/tina-media";

describe("normalizeTinaRepoMediaSrc", () => {
  it("rewrites assets.tina.io URLs under /images/ to a repo path", () => {
    expect(
      normalizeTinaRepoMediaSrc(
        "https://assets.tina.io/foo/bar/baz/images/hero.jpg?x=1"
      )
    ).toBe("/images/hero.jpg");
  });

  it("rewrites assets.tinajs.io the same way", () => {
    expect(
      normalizeTinaRepoMediaSrc(
        "https://assets.tinajs.io/org/repo/branch/images/hero.jpg"
      )
    ).toBe("/images/hero.jpg");
  });

  it("falls back to /images/<file> when CDN path has no /images/ segment", () => {
    expect(
      normalizeTinaRepoMediaSrc(
        "https://assets.tinajs.io/org/repo/branch/photo.png"
      )
    ).toBe("/images/photo.png");
  });

  it("leaves non-Tina URLs unchanged", () => {
    expect(normalizeTinaRepoMediaSrc("/images/local.jpg")).toBe("/images/local.jpg");
    expect(normalizeTinaRepoMediaSrc("https://example.com/x.jpg")).toBe(
      "https://example.com/x.jpg"
    );
  });
});

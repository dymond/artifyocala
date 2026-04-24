import { describe, expect, it } from "vitest";
import {
  areAllPathsIgnorable,
  isIgnorablePathOnly,
  normalizeChangedPath,
} from "../../scripts/netlify-ignore-allowlist.mjs";

describe("netlify-ignore-allowlist", () => {
  it("normalizes paths", () => {
    expect(normalizeChangedPath(" ./foo\\bar.md ")).toBe("foo/bar.md");
  });

  it("allows repo metadata and CI-only paths", () => {
    expect(isIgnorablePathOnly("README.md")).toBe(true);
    expect(isIgnorablePathOnly(".github/workflows/ci.yml")).toBe(true);
    expect(isIgnorablePathOnly("lefthook.yml")).toBe(true);
    expect(isIgnorablePathOnly("AGENTS.md")).toBe(true);
    expect(isIgnorablePathOnly("scripts/netlify-ignore-build.mjs")).toBe(true);
  });

  it("rejects site-relevant paths", () => {
    expect(isIgnorablePathOnly("src/pages/index.astro")).toBe(false);
    expect(isIgnorablePathOnly("tina/config.ts")).toBe(false);
    expect(isIgnorablePathOnly("netlify.toml")).toBe(false);
    expect(isIgnorablePathOnly("public/images/hero.png")).toBe(false);
  });

  it("all ignorable only when every path is allowlisted", () => {
    expect(areAllPathsIgnorable(["README.md", ".github/PULL_REQUEST_TEMPLATE.md"])).toBe(
      true,
    );
    expect(areAllPathsIgnorable(["README.md", "package.json"])).toBe(false);
    expect(areAllPathsIgnorable([])).toBe(false);
  });
});

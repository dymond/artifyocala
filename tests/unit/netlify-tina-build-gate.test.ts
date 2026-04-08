import { describe, expect, it } from "vitest";
import {
  needsTinaBuild,
  normalizeChangedPath,
  pathRequiresTinaBuild,
  resolveTinaStrategyFromEnv,
  shouldRunFullTinaWithoutDiff,
} from "../../scripts/netlify-tina-build-gate.mjs";

describe("netlify-tina-build-gate", () => {
  describe("normalizeChangedPath", () => {
    it("trims and normalizes slashes", () => {
      expect(normalizeChangedPath("  foo/bar\\baz  ")).toBe("foo/bar/baz");
    });
  });

  describe("pathRequiresTinaBuild", () => {
    it("is true for tina config", () => {
      expect(pathRequiresTinaBuild("tina/config.ts")).toBe(true);
    });

    it("is false for tina CLI cache only", () => {
      expect(
        pathRequiresTinaBuild("tina/__generated__/.cache/something")
      ).toBe(false);
    });

    it("is true for generated types outside cache", () => {
      expect(pathRequiresTinaBuild("tina/__generated__/types.ts")).toBe(true);
    });

    it("is true for lockfile and astro config", () => {
      expect(pathRequiresTinaBuild("package.json")).toBe(true);
      expect(pathRequiresTinaBuild("pnpm-lock.yaml")).toBe(true);
      expect(pathRequiresTinaBuild("astro.config.mjs")).toBe(true);
    });

    it("is true for astro-tina-directive and admin bundle", () => {
      expect(pathRequiresTinaBuild("astro-tina-directive/register.mjs")).toBe(
        true
      );
      expect(pathRequiresTinaBuild("public/admin/index.html")).toBe(true);
    });

    it("is true for tina graphql client wrapper", () => {
      expect(pathRequiresTinaBuild("src/lib/tina-graphql-client.ts")).toBe(true);
    });

    it("is false for CMS content and public assets outside admin", () => {
      expect(pathRequiresTinaBuild("src/content/pages/home.json")).toBe(false);
      expect(pathRequiresTinaBuild("src/content/programs/foo.mdx")).toBe(false);
      expect(pathRequiresTinaBuild("public/images/hero.jpg")).toBe(false);
    });

    it("is false for unrelated app code", () => {
      expect(pathRequiresTinaBuild("src/pages/index.astro")).toBe(false);
      expect(pathRequiresTinaBuild("README.md")).toBe(false);
    });
  });

  describe("needsTinaBuild", () => {
    it("is true when there are no paths (safe default)", () => {
      expect(needsTinaBuild([])).toBe(true);
    });

    it("is true if any path requires Tina", () => {
      expect(
        needsTinaBuild(["src/content/x.md", "tina/config.ts"])
      ).toBe(true);
    });

    it("is false if only content and public media", () => {
      expect(
        needsTinaBuild([
          "src/content/pages/home.json",
          "public/uploads/photo.png",
        ])
      ).toBe(false);
    });
  });

  describe("resolveTinaStrategyFromEnv", () => {
    it("returns full for FORCE_TINA_BUILD", () => {
      expect(resolveTinaStrategyFromEnv({ FORCE_TINA_BUILD: "1" })).toBe(
        "full"
      );
      expect(resolveTinaStrategyFromEnv({ FORCE_TINA_BUILD: "true" })).toBe(
        "full"
      );
    });

    it("returns skip for SKIP_TINA_BUILD", () => {
      expect(resolveTinaStrategyFromEnv({ SKIP_TINA_BUILD: "1" })).toBe(
        "skip"
      );
    });

    it("returns diff otherwise", () => {
      expect(resolveTinaStrategyFromEnv({})).toBe("diff");
    });
  });

  describe("shouldRunFullTinaWithoutDiff", () => {
    it("is true without COMMIT_REF", () => {
      expect(shouldRunFullTinaWithoutDiff({})).toBe(true);
    });

    it("is true when CACHED equals COMMIT", () => {
      expect(
        shouldRunFullTinaWithoutDiff({
          COMMIT_REF: "abc",
          CACHED_COMMIT_REF: "abc",
        })
      ).toBe(true);
    });

    it("is true when CACHED missing", () => {
      expect(
        shouldRunFullTinaWithoutDiff({
          COMMIT_REF: "abc",
        })
      ).toBe(true);
    });

    it("is false when both differ", () => {
      expect(
        shouldRunFullTinaWithoutDiff({
          COMMIT_REF: "def",
          CACHED_COMMIT_REF: "abc",
        })
      ).toBe(false);
    });
  });
});

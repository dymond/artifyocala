import { describe, expect, it } from "vitest";
import { shouldDeferProductionMainToCiHook } from "../../scripts/netlify-ci-gate.mjs";

describe("netlify-ci-gate", () => {
  it("defers only production main when not forced on", () => {
    expect(
      shouldDeferProductionMainToCiHook({
        CONTEXT: "production",
        BRANCH: "main",
      }),
    ).toBe(true);
    expect(
      shouldDeferProductionMainToCiHook({
        CONTEXT: "deploy-preview",
        BRANCH: "main",
      }),
    ).toBe(false);
    expect(
      shouldDeferProductionMainToCiHook({
        CONTEXT: "production",
        BRANCH: "feature",
      }),
    ).toBe(false);
  });

  it("does not defer when NETLIFY_IGNORE_BUILD disables ignore", () => {
    expect(
      shouldDeferProductionMainToCiHook({
        CONTEXT: "production",
        BRANCH: "main",
        NETLIFY_IGNORE_BUILD: "0",
      }),
    ).toBe(false);
    expect(
      shouldDeferProductionMainToCiHook({
        CONTEXT: "production",
        BRANCH: "main",
        NETLIFY_IGNORE_BUILD: "false",
      }),
    ).toBe(false);
  });
});

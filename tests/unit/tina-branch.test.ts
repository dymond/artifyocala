import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getTinaGitBranch } from "../../tina/branch";

const keys = [
  "TINA_CONTENT_BRANCH",
  "BRANCH",
  "GITHUB_BRANCH",
  "NETLIFY_BRANCH",
  "VERCEL_GIT_BRANCH",
  "HEAD",
] as const;

describe("getTinaGitBranch", () => {
  const snapshot: Partial<Record<(typeof keys)[number], string | undefined>> = {};

  beforeEach(() => {
    for (const k of keys) {
      snapshot[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of keys) {
      const v = snapshot[k];
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  });

  it("prefers TINA_CONTENT_BRANCH over BRANCH", () => {
    process.env.TINA_CONTENT_BRANCH = "staging";
    process.env.BRANCH = "main";
    expect(getTinaGitBranch()).toBe("staging");
  });

  it("uses Netlify BRANCH when override unset", () => {
    process.env.BRANCH = "main";
    expect(getTinaGitBranch()).toBe("main");
  });

  it("falls back to main when no git env is set", () => {
    expect(getTinaGitBranch()).toBe("main");
  });
});

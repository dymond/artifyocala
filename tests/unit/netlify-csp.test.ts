import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildContentSecurityPolicyReportOnly,
  buildEditingSurfacesContentSecurityPolicy,
} from "../../scripts/netlify-csp.mjs";

describe("buildContentSecurityPolicy (public)", () => {
  it("keeps connect-src tight for anonymous pages", () => {
    const csp = buildContentSecurityPolicy({ allowEval: true });
    expect(csp).toContain("connect-src");
    expect(csp).toContain("https://www.google-analytics.com");
    expect(csp).not.toContain("content.tinajs.io");
    expect(csp).not.toContain("api.github.com");
    expect(csp).not.toContain("s3.us-east-1.amazonaws.com");
  });

  it("report-only policy extends the enforced policy", () => {
    const enforced = buildContentSecurityPolicy({ allowEval: true });
    const reportOnly = buildContentSecurityPolicyReportOnly({ allowEval: true });
    expect(reportOnly.startsWith(enforced)).toBe(true);
    expect(reportOnly).toContain("require-trusted-types-for");
  });
});

describe("buildEditingSurfacesContentSecurityPolicy (CMS)", () => {
  it("allows broad connect-src for Tina / OAuth / uploads", () => {
    const csp = buildEditingSurfacesContentSecurityPolicy();
    expect(csp).toContain("connect-src *");
    expect(csp).toContain("script-src *");
  });

  it("is distinct from the public policy", () => {
    const pub = buildContentSecurityPolicy({ allowEval: true });
    const cms = buildEditingSurfacesContentSecurityPolicy();
    expect(cms).not.toBe(pub);
    expect(pub).toContain("connect-src 'self'");
    expect(cms).toContain("connect-src *");
  });
});

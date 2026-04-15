import { describe, expect, it } from "vitest";
import {
  buildContentSecurityPolicy,
  buildContentSecurityPolicyReportOnly,
} from "../../scripts/netlify-csp.mjs";

describe("buildContentSecurityPolicy", () => {
  it("includes TinaCloud + GitHub + Cognito connect-src when Tina is enabled", () => {
    const csp = buildContentSecurityPolicy({ allowEval: true, allowTina: true });
    expect(csp).toContain("connect-src");
    expect(csp).toContain("https://content.tinajs.io");
    expect(csp).toContain("https://assets.tinajs.io");
    expect(csp).toContain("https://api.github.com");
    expect(csp).toContain("https://github.com");
    expect(csp).toContain("https://login.github.com");
    expect(csp).toContain("https://*.auth.us-east-1.amazoncognito.com");
    expect(csp).toContain("https://cognito-idp.us-east-1.amazonaws.com");
    expect(csp).toContain("https://*.execute-api.us-east-1.amazonaws.com");
    expect(csp).toContain("https://*.tina.io");
    expect(csp).toContain("https://s3.us-east-1.amazonaws.com");
  });

  it("does not widen connect-src for GitHub when Tina is disabled", () => {
    const csp = buildContentSecurityPolicy({ allowEval: true, allowTina: false });
    expect(csp).not.toContain("api.github.com");
    expect(csp).not.toContain("amazoncognito.com");
    expect(csp).not.toContain("s3.us-east-1.amazonaws.com");
  });

  it("report-only policy extends the enforced policy", () => {
    const enforced = buildContentSecurityPolicy({ allowEval: true, allowTina: true });
    const reportOnly = buildContentSecurityPolicyReportOnly({
      allowEval: true,
      allowTina: true,
    });
    expect(reportOnly.startsWith(enforced)).toBe(true);
    expect(reportOnly).toContain("require-trusted-types-for");
  });
});

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import {
  buildContentSecurityPolicy,
  buildContentSecurityPolicyReportOnly,
  buildEditingSurfacesContentSecurityPolicy,
} from "./netlify-csp.mjs";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "_headers");

const isEditSite =
  process.env.ARTIFY_NETLIFY_EDIT_SITE === "1" ||
  process.env.PUBLIC_ARTIFY_VISUAL_EDITING === "1";

const commitRef =
  process.env.COMMIT_REF?.trim() ||
  process.env.GITHUB_SHA?.trim() ||
  process.env.HEAD?.trim() ||
  process.env.NETLIFY_BRANCH?.trim() ||
  "";

const lines = [];

// Long-lived assets
lines.push("/_astro/*");
lines.push("  Cache-Control: public, max-age=31536000, immutable");
lines.push("");

lines.push("/images/*");
lines.push("  Cache-Control: public, max-age=2592000");
lines.push("");

// Tina surfaces: avoid sticky HTML/runtime caching.
// Keep hashed assets cacheable, but force HTML + app shell to revalidate on every load.
lines.push("/admin/index.html");
lines.push("  Cache-Control: no-store");
lines.push("  Netlify-CDN-Cache-Control: no-store");
lines.push("");

lines.push("/admin/*");
lines.push("  Cache-Control: no-store");
lines.push("  Netlify-CDN-Cache-Control: no-store");
lines.push("");

lines.push("/admin/assets/*");
lines.push("  Cache-Control: public, max-age=31536000, immutable");
lines.push("");

// Baseline security headers
lines.push("/*");
if (!isEditSite) {
  lines.push(
    `  Content-Security-Policy: ${buildContentSecurityPolicy({ allowEval: true })}`
  );
  lines.push(
    `  Content-Security-Policy-Report-Only: ${buildContentSecurityPolicyReportOnly({
      allowEval: true,
    })}`
  );
  lines.push("  Cross-Origin-Opener-Policy: same-origin");
} else {
  // Edit site: avoid CSP/COOP breakage in Tina Admin.
  // Keep non-CSP security headers below; Tina itself remains behind auth.
}
lines.push("  Referrer-Policy: strict-origin-when-cross-origin");
lines.push("  X-Content-Type-Options: nosniff");
// Allow same-origin framing for Tina visual editor iframe.
lines.push("  X-Frame-Options: SAMEORIGIN");
if (commitRef) {
  lines.push(`  X-Artify-Commit: ${commitRef}`);
}
lines.push(`  X-Artify-Site: ${isEditSite ? "edit" : "prod"}`);
// Keep HSTS scoped on production so new subdomains can be brought up safely.
lines.push(
  `  Strict-Transport-Security: ${
    isEditSite
      ? "max-age=31536000; includeSubDomains; preload"
      : "max-age=31536000"
  }`
);
lines.push("  Permissions-Policy: attribution-reporting=(), shared-storage=()");
lines.push("");

// Production: override `/*` strict CSP for Tina — relaxed policy, no report-only noise.
if (!isEditSite) {
  const cmsCsp = buildEditingSurfacesContentSecurityPolicy();
  lines.push("/admin/*");
  lines.push(`  Content-Security-Policy: ${cmsCsp}`);
  lines.push("  Cross-Origin-Opener-Policy: same-origin-allow-popups");
  lines.push("");

  lines.push("/tina-preview/*");
  lines.push("  Cache-Control: no-store");
  lines.push("  Netlify-CDN-Cache-Control: no-store");
  lines.push(`  Content-Security-Policy: ${cmsCsp}`);
  lines.push("  Cross-Origin-Opener-Policy: same-origin-allow-popups");
  lines.push("");
} else {
  lines.push("/tina-preview/*");
  lines.push("  Cache-Control: no-store");
  lines.push("  Netlify-CDN-Cache-Control: no-store");
  lines.push("");
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, lines.join("\n") + "\n", "utf8");
process.stdout.write(
  `write-netlify-headers: wrote ${path.relative(ROOT, OUT)} (editSite=${isEditSite ? "1" : "0"})\n`
);

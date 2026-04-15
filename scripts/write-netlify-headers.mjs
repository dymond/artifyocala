import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

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

function csp({ allowEval, allowTina }) {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(allowEval ? ["'unsafe-eval'"] : []),
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    ...(allowTina ? ["https://us-assets.i.posthog.com"] : []),
  ].join(" ");

  const connectSrc = [
    "'self'",
    "https://www.google-analytics.com",
    "https://region1.google-analytics.com",
    "https://www.googletagmanager.com",
    ...(allowTina
      ? [
          "https://content.tinajs.io",
          "https://identity.tinajs.io",
          "https://identity-v2.tinajs.io",
          "https://app.tina.io",
          "https://us.i.posthog.com",
        ]
      : []),
  ].join(" ");

  const frameSrc = ["'self'", ...(allowTina ? ["https://app.tina.io"] : [])].join(
    " "
  );

  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(allowTina ? ["https://fonts.googleapis.com"] : []),
  ].join(" ");

  const fontSrc = ["'self'", "data:", ...(allowTina ? ["https://fonts.gstatic.com"] : [])].join(
    " "
  );

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    // Allow Tina visual editor to iframe the site (same-origin only).
    "frame-ancestors 'self'",
    `frame-src ${frameSrc}`,
    "form-action 'self'",
    "img-src 'self' data: https:",
    `font-src ${fontSrc}`,
    `style-src ${styleSrc}`,
    `script-src ${scriptSrc}`,
    `connect-src ${connectSrc}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function cspReportOnly({ allowEval, allowTina }) {
  return [
    csp({ allowEval, allowTina }),
    "require-trusted-types-for 'script'",
    "trusted-types default",
    "report-sample",
  ].join("; ");
}

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

lines.push("/tina-preview/*");
lines.push("  Cache-Control: no-store");
lines.push("  Netlify-CDN-Cache-Control: no-store");
lines.push("");

// Baseline security headers
lines.push("/*");
if (!isEditSite) {
  lines.push(
    `  Content-Security-Policy: ${csp({ allowEval: true, allowTina: false })}`
  );
  lines.push(
    `  Content-Security-Policy-Report-Only: ${cspReportOnly({
      allowEval: true,
      allowTina: false,
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

// Production site: keep CSP strict on public pages but allow Tina admin to function.
if (!isEditSite) {
  lines.push("/admin/*");
  lines.push(`  Content-Security-Policy: ${csp({ allowEval: true, allowTina: true })}`);
  lines.push(
    `  Content-Security-Policy-Report-Only: ${cspReportOnly({
      allowEval: true,
      allowTina: true,
    })}`
  );
  // Tina auth uses a cross-origin popup; COOP same-origin breaks window.opener flows.
  lines.push("  Cross-Origin-Opener-Policy: same-origin-allow-popups");
  lines.push("");
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, lines.join("\n") + "\n", "utf8");
process.stdout.write(
  `write-netlify-headers: wrote ${path.relative(ROOT, OUT)} (editSite=${isEditSite ? "1" : "0"})\n`
);


import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "_headers");

const isEditSite =
  process.env.ARTIFY_NETLIFY_EDIT_SITE === "1" ||
  process.env.PUBLIC_ARTIFY_VISUAL_EDITING === "1";

function csp({ allowEval, allowTina }) {
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(allowEval ? ["'unsafe-eval'"] : []),
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
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
          "https://app.tina.io",
        ]
      : []),
  ].join(" ");

  const frameSrc = ["'self'", ...(allowTina ? ["https://app.tina.io"] : [])].join(
    " "
  );

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    `frame-src ${frameSrc}`,
    "form-action 'self'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "style-src 'self' 'unsafe-inline'",
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

// Baseline security headers
lines.push("/*");
lines.push(
  `  Content-Security-Policy: ${csp({ allowEval: isEditSite, allowTina: isEditSite })}`
);
lines.push(
  `  Content-Security-Policy-Report-Only: ${cspReportOnly({
    allowEval: isEditSite,
    allowTina: isEditSite,
  })}`
);
lines.push("  Cross-Origin-Opener-Policy: same-origin");
lines.push("  Referrer-Policy: strict-origin-when-cross-origin");
lines.push("  X-Content-Type-Options: nosniff");
lines.push("  X-Frame-Options: DENY");
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
  lines.push("");
}

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, lines.join("\n") + "\n", "utf8");
process.stdout.write(
  `write-netlify-headers: wrote ${path.relative(ROOT, OUT)} (editSite=${isEditSite ? "1" : "0"})\n`
);


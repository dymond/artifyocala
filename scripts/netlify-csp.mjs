/**
 * Content-Security-Policy strings for Netlify `_headers`.
 *
 * - Public HTML uses a strict policy (`buildContentSecurityPolicy`).
 * - Tina admin (`/admin/*`) and visual preview (`/tina-preview/*`) use a relaxed
 *   policy so the CMS is not brittle against Tina/AWS/GitHub URL changes.
 */

/** CSP for anonymous site visitors (strict). */
export function buildContentSecurityPolicy({ allowEval }) {
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
  ].join(" ");

  const frameSrc = "'self'";

  const styleSrc = ["'self'", "'unsafe-inline'"].join(" ");

  const fontSrc = ["'self'", "data:"].join(" ");

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

export function buildContentSecurityPolicyReportOnly({ allowEval }) {
  return [
    buildContentSecurityPolicy({ allowEval }),
    "require-trusted-types-for 'script'",
    "trusted-types default",
    "report-sample",
  ].join("; ");
}

/**
 * CSP for Tina admin and `/tina-preview/*` — intentionally broad so uploads,
 * OAuth popups, and third-party scripts are not blocked by an allowlist.
 */
export function buildEditingSurfacesContentSecurityPolicy() {
  return [
    "default-src * data: blob:",
    "script-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
    "connect-src *",
    "img-src * data: blob:",
    "style-src * 'unsafe-inline'",
    "font-src * data:",
    "frame-src *",
    "worker-src * blob:",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join("; ");
}

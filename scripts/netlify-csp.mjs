/**
 * Content-Security-Policy strings for Netlify `_headers`.
 * Tina admin needs extra `connect-src` entries per TinaCloud network requirements:
 * https://tina.io/docs/tinacloud/network-requirements
 */

export function buildContentSecurityPolicy({ allowEval, allowTina }) {
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
          "https://assets.tinajs.io",
          "https://assets.tina.io",
          "https://*.tina.io",
          "https://app.tina.io",
          "https://us.i.posthog.com",
          // TinaCloud media: presigned PutObject to regional S3 (path-style host).
          "https://s3.us-east-1.amazonaws.com",
          // TinaCloud auth (AWS Cognito / API Gateway)
          "https://*.auth.us-east-1.amazoncognito.com",
          "https://cognito-idp.us-east-1.amazonaws.com",
          "https://*.execute-api.us-east-1.amazonaws.com",
          // Git provider (default: GitHub) for token exchange and Git-backed writes
          "https://github.com",
          "https://api.github.com",
          "https://login.github.com",
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

export function buildContentSecurityPolicyReportOnly({ allowEval, allowTina }) {
  return [
    buildContentSecurityPolicy({ allowEval, allowTina }),
    "require-trusted-types-for 'script'",
    "trusted-types default",
    "report-sample",
  ].join("; ");
}

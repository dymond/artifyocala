#!/usr/bin/env node
/**
 * Google PageSpeed Insights API v5 — prints scores/metrics to stdout only (no report files).
 *
 * Requires an API key with "PageSpeed Insights API" enabled in Google Cloud Console.
 * https://developers.google.com/speed/docs/insights/v5/get-started
 *
 * Usage:
 *   PAGESPEED_INSIGHTS_API_KEY=... node scripts/pagespeed-insights.mjs [url...] [--desktop]
 *
 * Default URLs (mobile): home, about, donate, volunteer
 */
import process from "node:process";

const DEFAULT_URLS = [
  "https://www.artifyocala.org/",
  "https://www.artifyocala.org/about/",
  "https://www.artifyocala.org/donate/",
  "https://www.artifyocala.org/volunteer/",
];

function parseArgs(argv) {
  const urls = [];
  let desktop = false;
  for (const a of argv) {
    if (a === "--desktop") {
      desktop = true;
      continue;
    }
    if (a.startsWith("-")) continue;
    if (a.startsWith("http://") || a.startsWith("https://")) urls.push(a);
  }
  return { urls: urls.length ? urls : DEFAULT_URLS, desktop };
}

function pickAudit(audits, id) {
  const a = audits?.[id];
  if (!a) return "—";
  return a.displayValue ?? (a.numericValue != null ? String(a.numericValue) : "—");
}

async function runOne(url, key, strategy) {
  const u = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  u.searchParams.set("url", url);
  u.searchParams.set("key", key);
  u.searchParams.set("strategy", strategy);

  const res = await fetch(u.href);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = body?.error?.message || JSON.stringify(body).slice(0, 400);
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  const lr = body.lighthouseResult;
  if (!lr) {
    throw new Error("Unexpected API response (no lighthouseResult).");
  }

  const cats = lr.categories ?? {};
  const audits = lr.audits ?? {};

  const perf = cats.performance?.score;
  const a11y = cats.accessibility?.score;
  const bp = cats["best-practices"]?.score;
  const seo = cats.seo?.score;

  const score = (n) =>
    n == null ? "—" : `${Math.round(n * 100)}`;

  return {
    url,
    strategy,
    scores: {
      performance: score(perf),
      accessibility: score(a11y),
      bestPractices: score(bp),
      seo: score(seo),
    },
    metrics: {
      fcp: pickAudit(audits, "first-contentful-paint"),
      lcp: pickAudit(audits, "largest-contentful-paint"),
      tbt: pickAudit(audits, "total-blocking-time"),
      cls: pickAudit(audits, "cumulative-layout-shift"),
      si: pickAudit(audits, "speed-index"),
    },
  };
}

async function main() {
  const key =
    process.env.PAGESPEED_INSIGHTS_API_KEY?.trim() ||
    process.env.GOOGLE_PAGESPEED_API_KEY?.trim();

  if (!key) {
    console.error(
      "Missing API key. Set PAGESPEED_INSIGHTS_API_KEY (or GOOGLE_PAGESPEED_API_KEY).\n" +
        "Enable PageSpeed Insights API in Google Cloud and create a browser/API key.\n" +
        "https://developers.google.com/speed/docs/insights/v5/get-started"
    );
    process.exitCode = 1;
    return;
  }

  const { urls, desktop } = parseArgs(process.argv.slice(2));
  const strategy = desktop ? "desktop" : "mobile";

  console.log(`PageSpeed Insights (${strategy}) — ${urls.length} URL(s)\n`);

  for (const url of urls) {
    try {
      const r = await runOne(url, key, strategy);
      console.log(r.url);
      console.log(
        `  scores  perf ${r.scores.performance}  a11y ${r.scores.accessibility}  bp ${r.scores.bestPractices}  seo ${r.scores.seo}`
      );
      console.log(
        `  metrics FCP ${r.metrics.fcp}  LCP ${r.metrics.lcp}  TBT ${r.metrics.tbt}  CLS ${r.metrics.cls}  SI ${r.metrics.si}`
      );
      console.log("");
    } catch (e) {
      console.error(`${url}\n  ERROR: ${e instanceof Error ? e.message : e}\n`);
      process.exitCode = 1;
    }
  }
}

main();

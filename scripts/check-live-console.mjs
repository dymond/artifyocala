import { chromium } from "@playwright/test";

const URLS = [
  "https://artify.diy/",
  "https://edit.artify.diy/",
  "https://edit.artify.diy/admin/",
];

function isNoise(msg) {
  const t = String(msg || "");
  return (
    t.includes("Download the React DevTools") ||
    t.includes("A cookie associated with a cross-site resource") ||
    t.includes("Failed to load resource: the server responded with a status of 404") // handled separately by requestfailed
  );
}

function summarize(message) {
  // Normalize Playwright console message objects into readable strings.
  if (!message) return "";
  if (typeof message === "string") return message;
  if (message.text) return message.text();
  return String(message);
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

for (const url of URLS) {
  /** @type {string[]} */
  const consoleLines = [];
  /** @type {string[]} */
  const pageErrors = [];
  /** @type {string[]} */
  const failedRequests = [];

  page.removeAllListeners();

  page.on("console", (msg) => {
    const line = `[${msg.type()}] ${msg.text()}`;
    if (!isNoise(line)) consoleLines.push(line);
  });

  page.on("pageerror", (err) => {
    pageErrors.push(String(err?.stack || err?.message || err));
  });

  page.on("requestfailed", (req) => {
    const failure = req.failure();
    failedRequests.push(
      `${req.method()} ${req.url()} -> ${failure?.errorText || "requestfailed"}`
    );
  });

  // Some CSP failures only appear after the JS bootstraps; give it a moment.
  const resp = await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);

  const status = resp?.status() ?? "no-response";
  const ct = resp?.headers()?.["content-type"] ?? "";

  process.stdout.write("\n");
  process.stdout.write(`=== ${url} ===\n`);
  process.stdout.write(`status: ${status} content-type: ${ct}\n`);

  if (failedRequests.length) {
    process.stdout.write("\n-- failed requests --\n");
    for (const line of failedRequests.slice(0, 50)) process.stdout.write(line + "\n");
    if (failedRequests.length > 50)
      process.stdout.write(`(truncated ${failedRequests.length - 50} more)\n`);
  }

  if (pageErrors.length) {
    process.stdout.write("\n-- page errors --\n");
    for (const line of pageErrors.slice(0, 50)) process.stdout.write(line + "\n\n");
    if (pageErrors.length > 50)
      process.stdout.write(`(truncated ${pageErrors.length - 50} more)\n`);
  }

  if (consoleLines.length) {
    process.stdout.write("\n-- console --\n");
    for (const line of consoleLines.slice(0, 80)) process.stdout.write(line + "\n");
    if (consoleLines.length > 80)
      process.stdout.write(`(truncated ${consoleLines.length - 80} more)\n`);
  }

  if (!failedRequests.length && !pageErrors.length && !consoleLines.length) {
    process.stdout.write("\n(no console/page errors captured)\n");
  }
}

await browser.close();


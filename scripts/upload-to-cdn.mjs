#!/usr/bin/env node
/**
 * Upload missing images directly to Tina Cloud CDN using presigned S3 URLs.
 *
 * Usage:
 *   node scripts/upload-to-cdn.mjs --token <JWT> [--dry-run]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const CLIENT_ID = "9486e938-50e2-403c-a7bc-91d4d7196c40";
const ASSETS_API = `https://assets.tinajs.io/v1/${CLIENT_ID}`;
const CDN_BASE = `https://assets.tina.io/${CLIENT_ID}`;
const CONCURRENCY = 5;

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const tokenIdx = args.indexOf("--token");
const JWT = tokenIdx !== -1 ? args[tokenIdx + 1] : null;

if (!JWT) {
  console.error("Usage: node scripts/upload-to-cdn.mjs --token <JWT> [--dry-run]");
  process.exit(1);
}

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

async function probeImage(filename) {
  const url = `${CDN_BASE}/${encodeURIComponent(filename)}`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return { filename, ok: res.ok, status: res.status };
  } catch (e) {
    return { filename, ok: false, status: 0, error: e.message };
  }
}

async function probeBatch(filenames) {
  const results = [];
  for (let i = 0; i < filenames.length; i += CONCURRENCY) {
    const batch = filenames.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(probeImage));
    results.push(...batchResults);
    process.stdout.write(`\r  Probed ${results.length}/${filenames.length}`);
  }
  process.stdout.write("\n");
  return results;
}

async function uploadImage(filename) {
  const filePath = path.join(IMAGES_DIR, filename);
  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);

  // Step 1: Get presigned upload URL
  const uploadUrlRes = await fetch(`${ASSETS_API}/upload_url/${filename}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${JWT}` },
  });

  if (!uploadUrlRes.ok) {
    const body = await uploadUrlRes.text();
    return { filename, success: false, error: `upload_url failed (${uploadUrlRes.status}): ${body}` };
  }

  const { signedUrl, requestId } = await uploadUrlRes.json();
  if (!signedUrl) {
    return { filename, success: false, error: "No signedUrl in response" };
  }

  // Step 2: PUT file to S3 presigned URL
  const putRes = await fetch(signedUrl, {
    method: "PUT",
    body: fileBuffer,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(fileBuffer.length),
    },
  });

  if (!putRes.ok) {
    const body = await putRes.text();
    return { filename, success: false, error: `S3 PUT failed (${putRes.status}): ${body.substring(0, 200)}` };
  }

  return { filename, success: true };
}

async function main() {
  console.log("=== Tina Cloud CDN Direct Upload ===\n");

  const allFiles = fs.readdirSync(IMAGES_DIR).filter((f) => {
    const full = path.join(IMAGES_DIR, f);
    if (!fs.statSync(full).isFile()) return false;
    if (f.startsWith(".")) return false;
    return /\.(jpe?g|png|gif|webp|svg|avif|ico)$/i.test(f);
  });

  console.log(`Found ${allFiles.length} image files in public/images/`);
  console.log("Probing CDN for missing images...");

  const probeResults = await probeBatch(allFiles);
  const missing = probeResults.filter((r) => !r.ok);
  const present = probeResults.filter((r) => r.ok);

  console.log(`\n  Present on CDN: ${present.length}`);
  console.log(`  Missing from CDN: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log("All images are on the CDN. Nothing to do.");
    return;
  }

  if (DRY_RUN) {
    console.log("[DRY RUN] Would upload:");
    for (const m of missing) console.log(`  - ${m.filename}`);
    return;
  }

  // Test with first image to validate the JWT
  console.log(`Testing upload with: ${missing[0].filename}...`);
  const testResult = await uploadImage(missing[0].filename);
  if (!testResult.success) {
    console.error(`\nTest upload FAILED: ${testResult.error}`);
    console.error("The JWT may be expired. Get a fresh token and try again.");
    process.exit(1);
  }
  console.log(`  Test upload succeeded!\n`);

  // Upload remaining in batches of 3 (presign + PUT per image)
  const results = [testResult];
  const remaining = missing.slice(1);
  const UPLOAD_BATCH = 3;
  for (let i = 0; i < remaining.length; i += UPLOAD_BATCH) {
    const batch = remaining.slice(i, i + UPLOAD_BATCH);
    const batchResults = await Promise.all(
      batch.map(async (m) => {
        const result = await uploadImage(m.filename);
        const idx = i + results.length + 1;
        if (result.success) {
          console.log(`  [${results.length + batch.indexOf(m) + 1}/${missing.length}] ${m.filename} OK`);
        } else {
          console.log(`  [${results.length + batch.indexOf(m) + 1}/${missing.length}] ${m.filename} FAILED: ${result.error}`);
        }
        return result;
      })
    );
    results.push(...batchResults);
  }

  const succeeded = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`\n=== Upload Complete ===`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Failed: ${failed}`);

  if (failed > 0) {
    console.log("\nFailed uploads:");
    for (const r of results.filter((r) => !r.success)) {
      console.log(`  - ${r.filename}: ${r.error}`);
    }
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});

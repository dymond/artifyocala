#!/usr/bin/env node
/**
 * Force Tina Cloud CDN re-sync for images missing from assets.tina.io.
 *
 * Strategy:
 *   1. Probe each image in public/images/ against the CDN
 *   2. For images that return 404, stage a git rm + re-add cycle
 *   3. Push two commits: deletion then re-addition
 *   4. Tina Cloud's webhook picks up the fresh additions and syncs to CDN
 *
 * Usage:
 *   node scripts/force-cdn-resync.mjs --dry-run   # preview what would happen
 *   node scripts/force-cdn-resync.mjs              # execute the re-sync
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const CLIENT_ID = "9486e938-50e2-403c-a7bc-91d4d7196c40";
const CDN_BASE = `https://assets.tina.io/${CLIENT_ID}`;
const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 10;

async function probeImage(filename) {
  const url = `${CDN_BASE}/${encodeURIComponent(filename)}`;
  try {
    const res = await fetch(url, { method: "HEAD" });
    return { filename, status: res.status, ok: res.ok };
  } catch (e) {
    return { filename, status: 0, ok: false, error: e.message };
  }
}

async function probeBatch(filenames) {
  const results = [];
  for (let i = 0; i < filenames.length; i += CONCURRENCY) {
    const batch = filenames.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(probeImage));
    results.push(...batchResults);
    process.stdout.write(
      `\r  Probed ${results.length}/${filenames.length} images...`
    );
  }
  process.stdout.write("\n");
  return results;
}

function git(args, opts = {}) {
  return execSync(`git ${args}`, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: opts.stdio || "pipe",
    ...opts,
  }).trim();
}

async function main() {
  console.log("=== Tina Cloud CDN Re-Sync ===\n");

  // Ensure clean working tree
  const status = git("status --porcelain -- public/images/");
  if (status) {
    console.error(
      "ERROR: public/images/ has uncommitted changes. Commit or stash first.\n"
    );
    console.error(status);
    process.exit(1);
  }

  // Gather all image files (not directories, not _gen/)
  const allFiles = fs.readdirSync(IMAGES_DIR).filter((f) => {
    const full = path.join(IMAGES_DIR, f);
    if (!fs.statSync(full).isFile()) return false;
    if (f.startsWith(".")) return false;
    return /\.(jpe?g|png|gif|webp|svg|avif|ico)$/i.test(f);
  });

  console.log(`Found ${allFiles.length} image files in public/images/\n`);
  console.log("Probing Tina CDN for each file...");

  const results = await probeBatch(allFiles);
  const missing = results.filter((r) => !r.ok);
  const present = results.filter((r) => r.ok);

  console.log(`\n  Present on CDN: ${present.length}`);
  console.log(`  Missing from CDN: ${missing.length}\n`);

  if (missing.length === 0) {
    console.log("All images are on the CDN. Nothing to do.");
    return;
  }

  console.log("Missing files:");
  for (const m of missing) {
    console.log(`  - ${m.filename} (HTTP ${m.status})`);
  }
  console.log();

  if (DRY_RUN) {
    console.log("[DRY RUN] Would remove and re-add the above files in git.");
    console.log("[DRY RUN] No changes made.");
    return;
  }

  const missingPaths = missing.map((m) => `public/images/${m.filename}`);
  const tmpDir = path.join(ROOT, ".cdn-resync-tmp");

  try {
    // Back up missing files
    fs.mkdirSync(tmpDir, { recursive: true });
    for (const m of missing) {
      const src = path.join(IMAGES_DIR, m.filename);
      const dst = path.join(tmpDir, m.filename);
      fs.copyFileSync(src, dst);
    }
    console.log(`Backed up ${missing.length} files to ${tmpDir}\n`);

    // Step 1: git rm the missing files
    console.log("Step 1: Removing missing files from git...");
    for (const p of missingPaths) {
      git(`rm -f "${p}"`);
    }
    git(
      `commit -m "chore(media): temp remove ${missing.length} images for CDN re-sync"`
    );
    console.log("  Committed deletion.\n");

    // Step 2: Restore and re-add
    console.log("Step 2: Restoring and re-adding files...");
    for (const m of missing) {
      const src = path.join(tmpDir, m.filename);
      const dst = path.join(IMAGES_DIR, m.filename);
      fs.copyFileSync(src, dst);
    }
    for (const p of missingPaths) {
      git(`add "${p}"`);
    }
    git(
      `commit -m "chore(media): re-add ${missing.length} images to trigger CDN sync"`
    );
    console.log("  Committed re-addition.\n");

    // Step 3: Push both commits
    console.log("Step 3: Pushing both commits to origin...");
    git("push", { stdio: "inherit" });
    console.log("\nPush complete.");

    console.log(
      "\n=== Done! Tina Cloud should process both commits and sync the re-added files to the CDN. ==="
    );
    console.log(
      "Wait 1-2 minutes, then check the media manager. If files still don't appear,\n" +
        "the sync mechanism may need attention from Tina Cloud support."
    );
  } finally {
    // Clean up temp dir
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});

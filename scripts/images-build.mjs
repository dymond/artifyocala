import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "public", "images");
const OUT_DIR = path.join(ROOT, "public", "images", "_gen");
const MANIFEST_PATH = path.join(OUT_DIR, "manifest.json");
const CACHE_PATH = path.join(OUT_DIR, "cache.json");

const EXT_OK = new Set([".jpg", ".jpeg", ".png"]);
const TARGET_WIDTHS = [320, 480, 768, 1024, 1280, 1600];
const DEBUG = process.env.ARTIFY_IMAGES_DEBUG === "1";

export function filterChangedImagePaths(paths) {
  return (paths ?? [])
    .map((p) => String(p ?? "").trim())
    .filter(Boolean)
    .filter((p) => p.startsWith("public/images/"))
    .filter((p) => !p.startsWith("public/images/_gen/"))
    .filter((p) => EXT_OK.has(path.extname(p).toLowerCase()));
}

function relPublic(p) {
  return "/" + path.relative(path.join(ROOT, "public"), p).replaceAll(path.sep, "/");
}

async function readJsonIfExists(filePath) {
  try {
    const txt = await readFile(filePath, "utf8");
    return JSON.parse(txt);
  } catch (err) {
    if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) return null;
    throw err;
  }
}

async function listImagesRecursive(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await listImagesRecursive(full)));
    else out.push(full);
  }
  return out;
}

function isInOutDir(file) {
  const rel = path.relative(OUT_DIR, file);
  return !rel.startsWith("..");
}

export function makeVariantName(srcFile, width, fmtExt) {
  // Include relative directory to avoid collisions when the same basename exists
  // in different subfolders under public/images/.
  const relFromSrc = path
    .relative(SRC_DIR, srcFile)
    .replaceAll(path.sep, "/")
    .replace(/\.[^.]+$/, "");
  const safe = relFromSrc
    .split("/")
    .filter(Boolean)
    .join("__")
    .replace(/[^a-zA-Z0-9_-]/g, "-");
  return `${safe}.w${width}${fmtExt}`;
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch (err) {
    if (err && err.code === "ENOENT") return false;
    throw err;
  }
}

function uniqStrings(list) {
  return [...new Set(list)];
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = { mode: "auto", changed: [] };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--all") {
      out.mode = "all";
      continue;
    }
    if (a === "--changed") {
      out.mode = "changed";
      for (let j = i + 1; j < args.length; j++) {
        const v = args[j];
        if (String(v).startsWith("--")) break;
        out.changed.push(v);
        i = j;
      }
      continue;
    }
  }
  return out;
}

async function build({ mode, changed }) {
  await mkdir(OUT_DIR, { recursive: true });

  const changedImagePaths = filterChangedImagePaths(changed);
  const useChangedOnly = mode === "changed" && changedImagePaths.length > 0;

  const files = useChangedOnly
    ? changedImagePaths.map((p) => path.join(ROOT, p))
    : (await listImagesRecursive(SRC_DIR))
        .filter((f) => EXT_OK.has(path.extname(f).toLowerCase()))
        .filter((f) => !isInOutDir(f));

  /** Manifest: original public path -> variants */
  const oldManifest = (await readJsonIfExists(MANIFEST_PATH)) ?? {};
  /** Cache: original public path -> { mtimeMs, size, variants: "yes" | "no" } */
  const oldCache = (await readJsonIfExists(CACHE_PATH)) ?? {};
  const manifest = { ...oldManifest };
  const cache = { ...oldCache };
  let regenerated = 0;
  let written = 0;
  let reused = 0;
  const regeneratedKeys = [];

  // Clean up variants for deleted source images.
  // - Full build: compare against current filesystem.
  // - Changed build: only process deletions included in `--changed` list.
  if (useChangedOnly) {
    for (const srcFile of files) {
      if (await exists(srcFile)) continue;
      const srcPublic = relPublic(srcFile);
      const prevManifestEntry = oldManifest[srcPublic];
      if (prevManifestEntry?.length) {
        const removedVariantSrcs = uniqStrings(prevManifestEntry.map((v) => v.src).filter(Boolean));
        for (const vs of removedVariantSrcs) {
          const outPath = path.join(ROOT, "public", vs.replace(/^\//, ""));
          await rm(outPath, { force: true });
        }
      }
      delete manifest[srcPublic];
      delete cache[srcPublic];
    }
  } else {
    const currentKeys = new Set();
    for (const srcFile of files) {
      const srcPublic = relPublic(srcFile);
      currentKeys.add(srcPublic);
    }
    const removedKeys = Object.keys(oldManifest).filter((k) => !currentKeys.has(k));
    const removedVariantSrcs = uniqStrings(
      removedKeys.flatMap((k) => (oldManifest[k] ?? []).map((v) => v.src).filter(Boolean))
    );
    for (const vs of removedVariantSrcs) {
      const outPath = path.join(ROOT, "public", vs.replace(/^\//, ""));
      await rm(outPath, { force: true });
    }
    for (const k of removedKeys) {
      delete manifest[k];
      delete cache[k];
    }
  }

  for (const srcFile of files) {
    if (!(await exists(srcFile))) continue;
    const srcPublic = relPublic(srcFile);
    const st = await stat(srcFile);
    const mtimeMs = Math.trunc(st.mtimeMs);
    cache[srcPublic] = { mtimeMs, size: st.size, variants: "no" };

    const prev = oldCache[srcPublic];
    const prevManifestEntry = oldManifest[srcPublic];

    // If source image is unchanged and all variant files still exist, reuse the old manifest entry.
    if (
      prev &&
      prev.mtimeMs === mtimeMs &&
      prev.size === st.size &&
      prev.variants === "no" &&
      !prevManifestEntry
    ) {
      // Previously confirmed no beneficial variants; nothing to do.
      reused++;
      continue;
    }

    if (
      prev &&
      prevManifestEntry &&
      prev.mtimeMs === mtimeMs &&
      prev.size === st.size &&
      prevManifestEntry.length > 0
    ) {
      const variantFilesOk = (
        await Promise.all(
          prevManifestEntry.map((v) =>
            exists(path.join(ROOT, "public", String(v.src ?? "").replace(/^\//, "")))
          )
        )
      ).every(Boolean);
      if (variantFilesOk) {
        manifest[srcPublic] = prevManifestEntry;
        cache[srcPublic].variants = "yes";
        reused++;
        continue;
      }
    }

    // Changed/new image (or missing output): regenerate.
    regenerated++;
    if (DEBUG) regeneratedKeys.push(srcPublic);
    const srcBuf = await readFile(srcFile);
    const srcSize = srcBuf.byteLength;

    const meta = await sharp(srcBuf, { failOn: "none" }).metadata();
    const w0 = meta.width ?? 0;
    const h0 = meta.height ?? 0;
    if (w0 < 2 || h0 < 2) continue;
    const widths = TARGET_WIDTHS.filter((w) => w <= w0);
    if (widths.length === 0) continue;

    const variants = [];
    const outPathsWritten = [];

    for (const w of widths) {
      const h = Math.max(1, Math.round((h0 * w) / w0));

      // WEBP
      {
        const outName = makeVariantName(srcFile, w, ".webp");
        const outPath = path.join(OUT_DIR, outName);
        const buf = await sharp(srcBuf, { failOn: "none" })
          .resize(w, h, { fit: "fill" })
          .webp({ quality: 78, effort: 4 })
          .toBuffer();
        const bytes = buf.byteLength;
        if (bytes < srcSize) {
          await writeFile(outPath, buf);
          outPathsWritten.push(outPath);
          written++;
          variants.push({
            format: "webp",
            width: w,
            height: h,
            src: relPublic(outPath),
            bytes,
          });
        }
      }

      // AVIF (slower; still worth it for many photos)
      {
        const outName = makeVariantName(srcFile, w, ".avif");
        const outPath = path.join(OUT_DIR, outName);
        const buf = await sharp(srcBuf, { failOn: "none" })
          .resize(w, h, { fit: "fill" })
          .avif({ quality: 45, effort: 4 })
          .toBuffer();
        const bytes = buf.byteLength;
        if (bytes < srcSize) {
          await writeFile(outPath, buf);
          outPathsWritten.push(outPath);
          written++;
          variants.push({
            format: "avif",
            width: w,
            height: h,
            src: relPublic(outPath),
            bytes,
          });
        }
      }
    }

    if (variants.length > 0) {
      // group by format for easy <source srcset="...">
      manifest[srcPublic] = variants
        .sort((a, b) => (a.format === b.format ? a.width - b.width : a.format.localeCompare(b.format)));
      cache[srcPublic].variants = "yes";
    } else if (prevManifestEntry && prevManifestEntry.length > 0) {
      // If we previously had variants and regeneration produced none (e.g. TinyPNG beat us),
      // keep the previous variants rather than dropping responsive sources.
      const variantFilesOk = (
        await Promise.all(
          prevManifestEntry.map((v) =>
            exists(path.join(ROOT, "public", String(v.src ?? "").replace(/^\//, "")))
          )
        )
      ).every(Boolean);
      if (variantFilesOk) {
        manifest[srcPublic] = prevManifestEntry;
        cache[srcPublic].variants = "yes";
        reused++;
      }
    } else {
      // No variants: clear any stale manifest entry for this source.
      delete manifest[srcPublic];
    }

    // Remove any stale old variants for this src (if names/layout changed).
    if (prevManifestEntry && prevManifestEntry.length) {
      const keep = new Set(outPathsWritten.map((p) => relPublic(p)));
      const stale = uniqStrings(prevManifestEntry.map((v) => v.src).filter(Boolean)).filter(
        (s) => !keep.has(s)
      );
      for (const vs of stale) {
        const outPath = path.join(ROOT, "public", vs.replace(/^\//, ""));
        await rm(outPath, { force: true });
      }
    }
  }

  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  await writeFile(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf8");
  if (DEBUG && regeneratedKeys.length) {
    process.stdout.write(
      `images-build: regenerated keys:\n${regeneratedKeys.map((k) => `- ${k}`).join("\n")}\n`
    );
  }
  process.stdout.write(
    `images-build: wrote ${Object.keys(manifest).length} entries to ${relPublic(MANIFEST_PATH)} (reused ${reused}, regenerated ${regenerated}, wrote ${written} files${useChangedOnly ? `; changed-only=${changedImagePaths.length}` : ""})\n`
  );
}

const args = parseArgs(process.argv);
const mode = args.mode === "auto" ? (process.env.NETLIFY === "true" ? "all" : "all") : args.mode;
build({ mode, changed: args.changed }).catch((err) => {
  console.error(err);
  process.exitCode = 1;
});


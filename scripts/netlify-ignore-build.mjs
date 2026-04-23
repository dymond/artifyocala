/**
 * Netlify: `ignore` command — exit 0 = skip this build, non-zero = run build.
 * See: https://docs.netlify.com/build/configure-builds/ignore-builds/
 *
 * Uses the same ref pair as `scripts/netlify-build.mjs`.
 */
import { execSync } from "node:child_process";
import process from "node:process";
import {
  areAllPathsIgnorable,
  normalizeChangedPath,
} from "./netlify-ignore-allowlist.mjs";
import { shouldRunFullTinaWithoutDiff } from "./netlify-tina-build-gate.mjs";

function runBuild() {
  process.exit(1);
}

function skipBuild() {
  console.log(
    "[netlify-ignore-build] All changed files are non-site metadata — skipping build.",
  );
  process.exit(0);
}

function main() {
  const env = process.env;
  if (env.NETLIFY_IGNORE_BUILD === "0" || env.NETLIFY_IGNORE_BUILD === "false") {
    console.log("[netlify-ignore-build] NETLIFY_IGNORE_BUILD=0 — running build.");
    runBuild();
    return;
  }
  if (shouldRunFullTinaWithoutDiff(env)) {
    console.log(
      "[netlify-ignore-build] First deploy or missing/invalid ref range — running build.",
    );
    runBuild();
    return;
  }

  const cached = env.CACHED_COMMIT_REF?.trim();
  const commit = env.COMMIT_REF?.trim();
  if (!cached || !commit) {
    console.log(
      "[netlify-ignore-build] Missing COMMIT_REF or CACHED_COMMIT_REF — running build.",
    );
    runBuild();
    return;
  }

  let diffText = "";
  try {
    diffText = execSync(`git diff --name-only ${cached} ${commit}`, {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (e) {
    console.warn(
      "[netlify-ignore-build] git diff failed — running build.",
      e instanceof Error ? e.message : String(e),
    );
    runBuild();
    return;
  }

  const paths = diffText
    .split(/\r?\n/)
    .map(normalizeChangedPath)
    .filter(Boolean);

  if (paths.length === 0) {
    console.log(
      "[netlify-ignore-build] Empty diff in ignore step — running build (safe).",
    );
    runBuild();
    return;
  }

  if (areAllPathsIgnorable(paths)) {
    console.log(`[netlify-ignore-build] Changes (${paths.length} file(s)) only:`);
    for (const p of paths) {
      console.log(`  ${p}`);
    }
    skipBuild();
  } else {
    console.log("[netlify-ignore-build] At least one site-relevant path changed — running build.");
    runBuild();
  }
}

main();

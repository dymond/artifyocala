/**
 * Paths that do not require a new Netlify production build when they are
 * the *only* files changed. Conservative: if anything else changes, we build.
 *
 * (Git history here is mostly `src/`, `tina/`, `src/content/`, and images.)
 */

/**
 * @param {string} raw
 * @returns {string}
 */
export function normalizeChangedPath(raw) {
  return raw.trim().replace(/\\/g, "/").replace(/^\.\//, "");
}

/** @param {string} p */
function isRootAgentOrEditorDoc(p) {
  const n = normalizeChangedPath(p);
  const allowed = new Set([
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md",
    "WARP.md",
    "CODEX.md",
  ]);
  return allowed.has(n);
}

/**
 * @param {string} raw
 * @returns {boolean}
 */
export function isIgnorablePathOnly(raw) {
  const p = normalizeChangedPath(raw);
  if (!p) {
    return false;
  }
  if (p.startsWith(".github/")) {
    return true;
  }
  if (p === "lefthook.yml") {
    return true;
  }
  if (
    p === "scripts/netlify-ignore-build.mjs" ||
    p === "scripts/netlify-ignore-allowlist.mjs" ||
    p === "scripts/netlify-ci-gate.mjs"
  ) {
    return true;
  }
  if (isRootAgentOrEditorDoc(p)) {
    return true;
  }
  const rootMeta = new Set([
    "README.md",
    "LICENSE",
    "LICENSE.md",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
  ]);
  if (rootMeta.has(p)) {
    return true;
  }
  if (
    p === ".editorconfig" ||
    p === ".gitignore" ||
    p === ".gitattributes" ||
    p === ".nvmrc" ||
    p === ".prettierignore" ||
    p === "prettier.config.cjs" ||
    p === "prettier.config.mjs" ||
    p === ".prettierrc" ||
    p === ".prettierrc.json" ||
    p === "eslint.config.mjs" ||
    p === "eslint.config.js"
  ) {
    return true;
  }
  if (p === "tsconfig.eslint.json" || p === "tsconfig.eslint.cjs") {
    return true;
  }
  if (p.endsWith(".code-workspace")) {
    return true;
  }
  return false;
}

/**
 * @param {string[]} paths
 * @returns {boolean} true = safe to skip Netlify build
 */
export function areAllPathsIgnorable(paths) {
  if (!paths.length) {
    return false;
  }
  for (const item of paths) {
    if (!isIgnorablePathOnly(item)) {
      return false;
    }
  }
  return true;
}

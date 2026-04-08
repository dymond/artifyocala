/**
 * Pure helpers for deciding whether `tinacms build` must run on Netlify.
 * See README "Conditional Tina build on Netlify".
 */

/** @param {string} raw */
export function normalizeChangedPath(raw) {
  return raw.trim().replace(/\\/g, "/").replace(/^.\//, "");
}

/**
 * True if this single path change requires regenerating Tina schema/admin/types.
 * @param {string} raw
 */
export function pathRequiresTinaBuild(raw) {
  const p = normalizeChangedPath(raw);
  if (!p) return false;

  if (p.startsWith("tina/__generated__/.cache/")) {
    return false;
  }
  if (p.startsWith("tina/")) {
    return true;
  }
  if (p === "package.json" || p === "pnpm-lock.yaml") {
    return true;
  }
  if (p === "astro.config.mjs") {
    return true;
  }
  if (p.startsWith("astro-tina-directive/")) {
    return true;
  }
  if (p.startsWith("public/admin/")) {
    return true;
  }
  if (p === "src/lib/tina-graphql-client.ts") {
    return true;
  }
  return false;
}

/**
 * @param {string[]} changedPaths
 * @returns {boolean} true = run `tinacms build`; false = can skip
 */
export function needsTinaBuild(changedPaths) {
  if (!changedPaths || changedPaths.length === 0) {
    return true;
  }
  return changedPaths.some(pathRequiresTinaBuild);
}

/**
 * @param {Record<string, string | undefined>} env
 * @returns {"full" | "skip" | "diff"}
 */
export function resolveTinaStrategyFromEnv(env) {
  const force = env.FORCE_TINA_BUILD?.trim();
  if (force === "1" || force === "true") {
    return "full";
  }
  const skip = env.SKIP_TINA_BUILD?.trim();
  if (skip === "1" || skip === "true") {
    return "skip";
  }
  return "diff";
}

/**
 * @param {Record<string, string | undefined>} env
 */
export function shouldRunFullTinaWithoutDiff(env) {
  const commit = env.COMMIT_REF?.trim();
  const cached = env.CACHED_COMMIT_REF?.trim();
  if (!commit) {
    return true;
  }
  if (!cached || cached === commit) {
    return true;
  }
  return false;
}

/**
 * Git branch passed to Tina Content API (`.../github/<branch>`) and baked into the
 * admin build. Must match the branch where `src/content` and `public/images` live.
 *
 * Netlify sets `BRANCH` automatically; `NETLIFY_BRANCH` is optional/custom. Prefer
 * `TINA_CONTENT_BRANCH` when you need to pin production content (e.g. on deploy previews).
 *
 * Some CI setups set `HEAD` to a commit SHA. Using that as the GitHub "branch" breaks
 * Tina (sparse/wrong media). We ignore values that look like commit SHAs.
 */

/** True if the string looks like a git object id, not a branch name. */
function looksLikeGitCommitish(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  if (/^[0-9a-f]{40}$/i.test(t)) return true;
  if (t.includes("/") || t.includes("_")) return false;
  return /^[0-9a-f]{7,12}$/i.test(t);
}

function pickFirstPlausibleBranch(
  ...candidates: (string | undefined)[]
): string | undefined {
  for (const raw of candidates) {
    const v = raw?.trim();
    if (v && !looksLikeGitCommitish(v)) return v;
  }
  return undefined;
}

export function getTinaGitBranch(): string {
  const explicit = process.env.TINA_CONTENT_BRANCH?.trim();
  if (explicit) return explicit;

  const fromEnv = pickFirstPlausibleBranch(
    process.env.BRANCH,
    process.env.GITHUB_BRANCH,
    process.env.NETLIFY_BRANCH,
    process.env.VERCEL_GIT_BRANCH,
    process.env.HEAD
  );

  return fromEnv ?? "main";
}

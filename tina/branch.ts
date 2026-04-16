/**
 * Git branch passed to Tina Content API (`.../github/<branch>`) and baked into the
 * admin build. Must match the branch where `src/content` and `public/images` live.
 *
 * Netlify sets `BRANCH` automatically; `NETLIFY_BRANCH` is optional/custom. Prefer
 * `TINA_CONTENT_BRANCH` when you need to pin production content (e.g. on deploy previews).
 */
export function getTinaGitBranch(): string {
  return (
    process.env.TINA_CONTENT_BRANCH?.trim() ||
    process.env.BRANCH?.trim() ||
    process.env.GITHUB_BRANCH?.trim() ||
    process.env.NETLIFY_BRANCH?.trim() ||
    process.env.VERCEL_GIT_BRANCH?.trim() ||
    process.env.HEAD?.trim() ||
    "main"
  );
}

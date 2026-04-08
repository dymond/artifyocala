/**
 * Persist generated responsive image variants between Netlify builds.
 *
 * We generate AVIF/WebP variants into `public/images/_gen/` during CI.
 * Without caching, every deploy re-generates the full set, which is slow.
 *
 * Uses .cjs because the repo root has "type": "module".
 */
const CACHED_DIRS = ["public/images/_gen"];

module.exports = {
  async onPreBuild({ utils }) {
    for (const dir of CACHED_DIRS) {
      const restored = await utils.cache.restore(dir);
      if (restored) {
        console.log(`Restored build cache: ${dir}`);
      }
    }
  },
  async onPostBuild({ utils }) {
    for (const dir of CACHED_DIRS) {
      const saved = await utils.cache.save(dir);
      if (saved) {
        console.log(`Saved build cache: ${dir}`);
      }
    }
  },
};


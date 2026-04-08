/**
 * Persist Tina admin output between Netlify builds.
 *
 * `tinacms build` generates `public/admin/index.html`. If we skip Tina in CI,
 * Netlify's ephemeral workspace would otherwise lose `/admin` and force a full Tina build.
 *
 * Uses .cjs because the repo root has "type": "module".
 */
const CACHED_DIRS = ["public/admin"];

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


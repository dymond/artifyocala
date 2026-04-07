/**
 * Persist Astro + Vite caches between Netlify builds.
 *
 * `npm ci` removes `node_modules` each time, so without this plugin the default
 * `./node_modules/.astro` cache (see astro.config) is lost every deploy.
 */

const CACHED_DIRS = ["node_modules/.astro", "node_modules/.vite"];

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

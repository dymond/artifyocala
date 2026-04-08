/**
 * Persist Astro’s cache between Netlify builds.
 *
 * `npm ci` removes `node_modules` each time, so without this plugin the default
 * `./node_modules/.astro` cache (see astro.config) is lost every deploy.
 *
 * We do **not** cache `node_modules/.vite`: restoring stale dependency pre-bundles
 * across Vite / esbuild / astro.config changes has caused CI-only failures where
 * esbuild re-parses merged client chunks (`Syntax error "d"` in who-scroll-client).
 *
 * Uses .cjs because the repo root has "type": "module"; Netlify loads this file as ESM otherwise.
 */

const CACHED_DIRS = ["node_modules/.astro"];

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

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import alpinejs from '@astrojs/alpinejs';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

/**
 * Vite injects `__vitePreload` into the who-arch-loader chunk; Netlify’s build runs esbuild
 * on that output *before* `generateBundle` completes, so we must rewrite in `renderChunk`
 * (Rollup output phase), not only in `generateBundle`.
 */
function stripVitePreloadWhoArchLoaderOutputPlugin() {
  return {
    name: 'strip-vite-preload-who-arch-loader',
    renderChunk(code, chunk) {
      const label = chunk.fileName ?? chunk.name ?? '';
      if (typeof label !== 'string' || !label.includes('who-arch-loader')) return null;
      let out = code.replace(
        /\(\)\s*=>\s*__vitePreload\s*\(\s*\(\)\s*=>\s*import\s*\(([^)]+)\)\s*,[^)]+\)/g,
        '() => import($1)',
      );
      const start = out.indexOf('const loadWhoArchBackdrop');
      if (start > 0) out = out.slice(start);
      return { code: out, map: null };
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://artify.diy',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
    esbuild: {
      /** Keep `typeof x === "undefined"` form; some CI esbuild passes choke on `typeof x<"u"`. */
      minifyIdentifiers: false,
      minifySyntax: false,
      minifyWhitespace: false,
    },
    build: {
      minify: false,
      /** Avoid `__vitePreload` in client chunks (Netlify’s esbuild pass); enables safe `import()`. */
      modulePreload: false,
      rollupOptions: {
        output: {
          plugins: [stripVitePreloadWhoArchLoaderOutputPlugin()],
          manualChunks(id) {
            if (id.includes('who-arch-loader')) {
              return 'who-arch-loader';
            }
          },
        },
      },
    },
  },
  integrations: [
    mdx(),
    sitemap(),
    alpinejs(),
    partytown({
      config: {
        // Forward when you add GTM / GA4 via Partytown (see BaseLayout.astro).
        forward: ['dataLayer.push'],
      },
    }),
  ],
  adapter: netlify(),
});
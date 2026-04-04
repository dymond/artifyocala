// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import alpinejs from '@astrojs/alpinejs';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

/** Netlify runs esbuild on client chunks; Vite’s `__vitePreload` helper breaks that pass. */
function stripVitePreloadFromWhoArchLoader() {
  return {
    name: 'strip-vite-preload-who-arch-loader',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk' || !chunk.fileName.includes('who-arch-loader')) continue;
        let { code } = chunk;
        code = code.replace(
          /\(\)\s*=>\s*__vitePreload\s*\(\s*\(\)\s*=>\s*import\s*\(([^)]+)\)\s*,[^)]+\)/g,
          '() => import($1)',
        );
        const start = code.indexOf('const loadWhoArchBackdrop');
        if (start > 0) code = code.slice(start);
        chunk.code = code;
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://artify.diy',
  output: 'static',
  vite: {
    plugins: [tailwindcss(), stripVitePreloadFromWhoArchLoader()],
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
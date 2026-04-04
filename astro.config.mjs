// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import alpinejs from '@astrojs/alpinejs';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

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
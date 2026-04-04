// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import alpinejs from '@astrojs/alpinejs';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

/**
 * Netlify’s Vite dev middleware spawns Deno for edge emulation; after hot config
 * reloads it can throw `spawn EBADF` / “Could not establish a connection to the
 * Netlify Edge Functions local development server” and take down `astro dev`.
 * The adapter is only needed for `astro build` + deploy — omit it during dev unless
 * `ARTIFY_NETLIFY_DEV=1` (full Netlify emulation, e.g. after `netlify link`).
 */
const useNetlifyAdapter =
  process.env.ARTIFY_NETLIFY_DEV === '1' || process.argv.includes('build');

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
      modulePreload: false,
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
  adapter: useNetlifyAdapter ? netlify() : undefined,
});
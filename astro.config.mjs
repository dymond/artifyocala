// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';
import netlify from '@astrojs/netlify';
import alpinejs from '@astrojs/alpinejs';
import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.artifyocala.org',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
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
// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";
import netlify from "@astrojs/netlify";
import alpinejs from "@astrojs/alpinejs";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";

import react from "@astrojs/react";
import tinaClientDirective from "./astro-tina-directive/register.mjs";

/**
 * Netlify’s Vite dev middleware spawns Deno for edge emulation; after hot config
 * reloads it can throw `spawn EBADF` / “Could not establish a connection to the
 * Netlify Edge Functions local development server” and take down `astro dev`.
 * The adapter is only needed for `astro build` + deploy — omit it during dev unless
 * `ARTIFY_NETLIFY_DEV=1` (full Netlify emulation, e.g. after `netlify link`).
 */
const useNetlifyAdapter =
  process.env.ARTIFY_NETLIFY_DEV === "1" || process.argv.includes("build");
const isAstroBuild = process.argv.includes("build");
/** Netlify CI sets NETLIFY=true; keep local builds readable/unminified. */
const isNetlifyBuild = process.env.NETLIFY === "true";

/** Same as netlify.toml: /admin and /admin/ serve Tina admin without /index.html in the URL. */
function viteAdminPathRewrite() {
  return {
    name: "vite-admin-path-rewrite",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const raw = req.url ?? "";
        const q = raw.indexOf("?");
        const path = q === -1 ? raw : raw.slice(0, q);
        const search = q === -1 ? "" : raw.slice(q);
        if (path === "/admin" || path === "/admin/") {
          req.url = "/admin/index.html" + search;
        }
        next();
      });
    },
  };
}

// https://astro.build/config
const astroBuildConcurrency = Math.min(
  8,
  Math.max(
    1,
    Number.parseInt(process.env.ASTRO_BUILD_CONCURRENCY ?? "", 10) || 1
  )
);

export default defineConfig({
  site: "https://artify.diy",
  output: "static",
  compressHTML: isNetlifyBuild,
  build: {
    /** Netlify sets ASTRO_BUILD_CONCURRENCY (see netlify.toml); local default stays 1. */
    concurrency: astroBuildConcurrency,
  },
  vite: {
    plugins: [viteAdminPathRewrite(), tailwindcss()],
    build: {
      /**
       * Do not run esbuild minify on production bundles: Netlify’s pipeline re-parses chunks
       * and fails on output that uses esbuild’s `typeof` shorthand (`Syntax error "d"` in
       * who-scroll-client). `vite.esbuild.minifySyntax: false` is not reliably applied to
       * the minify pass. Rollup output stays unminified; gzip/Brotli at the edge still apply.
       */
      minify: false,
      modulePreload: isAstroBuild && isNetlifyBuild,
      /** Server/SSR chunks still exceed default 500 kB; manualChunks splits three/react/tina/shiki. */
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("three") || id.includes("three/")) {
              return "three";
            }
            if (
              id.includes("react-dom") ||
              id.includes("/react/") ||
              id.includes("\\react\\")
            ) {
              return "react-vendor";
            }
            if (id.includes("tinacms") || id.includes("@tinacms")) {
              return "tinacms-vendor";
            }
            if (id.includes("shiki") || id.includes("/shiki/")) {
              return "shiki-vendor";
            }
          },
        },
        onwarn(warning, warn) {
          if (
            warning.code === "UNUSED_EXTERNAL_IMPORT" &&
            warning.exporter === "tinacms/dist/client"
          ) {
            return;
          }
          warn(warning);
        },
      },
    },
    /**
     * Always disable esbuild name/syntax/whitespace “minify” during TS→JS transform.
     * When `vite.esbuild` was omitted for NETLIFY builds, esbuild emitted `typeof x>"u"`
     * shorthands that a later esbuild parse pass rejects (`Syntax error "d"` in client chunks).
     */
    esbuild: {
      minifyIdentifiers: false,
      minifySyntax: false,
      minifyWhitespace: false,
    },
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith("/404"),
    }),
    alpinejs(),
    partytown({
      config: {
        // Forward when you add GTM / GA4 via Partytown (see BaseLayout.astro).
        forward: ["dataLayer.push"],
      },
    }),
    react(),
    tinaClientDirective(),
  ],
  adapter: useNetlifyAdapter ? netlify() : undefined,
});

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
const enableAnalytics = Boolean(process.env.PUBLIC_GA_MEASUREMENT_ID);

/** Same as netlify.toml: /admin and /admin/ serve Tina admin without /index.html in the URL. */
function viteAdminPathRewrite() {
  /** @type {any} */
  const plugin = {
    name: "vite-admin-path-rewrite",
    apply: /** @type {any} */ ("serve"),
    /** @param {any} server */
    configureServer(server) {
      /** @type {(req: any, _res: any, next: any) => void} */
      const middleware = (req, _res, next) => {
        const raw = req.url ?? "";
        const q = raw.indexOf("?");
        const path = q === -1 ? raw : raw.slice(0, q);
        const search = q === -1 ? "" : raw.slice(q);
        if (path === "/admin" || path === "/admin/") {
          req.url = "/admin/index.html" + search;
        }
        next();
      };
      server.middlewares.use(middleware);
    },
  };
  return plugin;
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
  /** Must match the Netlify primary custom domain (canonical URLs, sitemap). */
  site: "https://artifyocala.org",
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
       * Minify bundles for Lighthouse/PageSpeed. Avoid esbuild minify output because Netlify’s
       * pipeline can re-parse chunks and fail on esbuild’s `typeof` shorthand. Use terser.
       */
      minify: isAstroBuild ? "terser" : false,
      cssMinify: isAstroBuild,
      /**
       * Lighthouse/PageSpeed can’t provide deep bundle insights without source maps.
       * Ship maps in production; they’re separate files and don’t change runtime behavior.
       */
      sourcemap: isAstroBuild,
      /**
       * With NETLIFY=true, Vite injects __vitePreload/__vite__mapDeps around dynamic imports.
       * Netlify’s later esbuild parse of SSR chunks then fails (`Syntax error "d"`). Disable
       * module preload polyfill for Netlify CI only; local `astro build` keeps default hints.
       */
      modulePreload: isAstroBuild && !isNetlifyBuild,
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
      filter: (page) =>
        !page.endsWith("/404") && !page.startsWith("/tina-preview/"),
    }),
    alpinejs(),
    ...(enableAnalytics
      ? [
          partytown({
            config: {
              // Forward when you add GTM / GA4 via Partytown (see BaseLayout.astro).
              forward: ["dataLayer.push"],
            },
          }),
        ]
      : []),
    react(),
    tinaClientDirective(),
  ],
  adapter: useNetlifyAdapter ? netlify() : undefined,
});

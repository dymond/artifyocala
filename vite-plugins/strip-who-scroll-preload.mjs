import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Vite injects __vitePreload + __vite__mapDeps around dynamic imports when module preload
 * is enabled. Netlify’s follow-up esbuild pass on SSR chunks can fail to parse that helper
 * (`Syntax error "d"`). Strip the helper from any emitted chunk that still contains it
 * (e.g. who-scroll inlined into PageVisualEdit).
 *
 * @param {string} code
 * @returns {string}
 */
export function stripVitePreloadFromChunk(code) {
  if (!code.includes("__vitePreload") && !code.includes("__vite__mapDeps")) {
    return code;
  }

  // Inlined dynamic-import chunks: mapDeps is emitted as the first line of the file.
  code = code.replace(/^const __vite__mapDeps=[^\n]*\n/m, "");

  // Preload runtime (scriptRel … __vitePreload) appears immediately before who-scroll state.
  if (code.includes("const scriptRel") && code.includes("let gen = 0")) {
    code = code.replace(/const scriptRel = [\s\S]*?\n(?=let gen = 0)/, "");
  }

  // Typical Vite emission (single line or multiline — may include /* @vite-ignore */ inside import()).
  // await __vitePreload(() => import("./chunk.js"), true ? __vite__mapDeps([0,1]) : void 0)
  // await __vitePreload(() => import(
  //   /* @vite-ignore */
  //   "./chunk.js"
  // ), true ? __vite__mapDeps([0,1]) : void 0)
  code = code.replace(
    /await __vitePreload\(\(\) => import\(\s*[\s\S]*?["'](\.\/[^"']+\.js)["']\s*\),\s*true\s*\?\s*__vite__mapDeps\(\[[^\]]*\]\)\s*:\s*void\s*0\)/g,
    'await import("$1")',
  );

  // Fallback if the second argument shape differs (keep chunk valid).
  code = code.replace(
    /await __vitePreload\(\(\) => import\(\s*[\s\S]*?["'](\.\/[^"']+\.js)["']\s*\),\s*void\s*0\)/g,
    'await import("$1")',
  );

  return code;
}

export default function stripWhoScrollPreload() {
  return {
    name: "strip-who-scroll-preload",
    enforce: "post",
    apply: "build",
    /**
     * Run before Rollup writes: downstream esbuild (same build) must not parse __vitePreload
     * or the build aborts before `writeBundle` runs on CI.
     */
    renderChunk(code) {
      if (!code.includes("__vitePreload") && !code.includes("__vite__mapDeps")) {
        return null;
      }
      const next = stripVitePreloadFromChunk(code);
      if (next === code) return null;
      return { code: next, map: null };
    },
    /**
     * Mutate Rollup’s final chunk strings so any later esbuild parse (same build) sees plain
     * `import()` — covers SSR / multi-output paths where `renderChunk` alone is not enough.
     */
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk" || typeof chunk.code !== "string") continue;
        if (!chunk.code.includes("__vitePreload") && !chunk.code.includes("__vite__mapDeps")) {
          continue;
        }
        const next = stripVitePreloadFromChunk(chunk.code);
        if (next !== chunk.code) chunk.code = next;
      }
    },
    /**
     * Last resort: patch files on disk (covers odd Astro write paths).
     */
    writeBundle(options, bundle) {
      const dir = options.dir;
      if (!dir) return;
      for (const fileName of Object.keys(bundle)) {
        if (!fileName.endsWith(".js")) continue;
        const fp = join(dir, fileName);
        let code;
        try {
          code = readFileSync(fp, "utf8");
        } catch {
          continue;
        }
        if (!code.includes("__vitePreload") && !code.includes("__vite__mapDeps")) continue;
        const next = stripVitePreloadFromChunk(code);
        if (next !== code) writeFileSync(fp, next);
      }
    },
  };
}

import { describe, expect, it } from "vitest";
import { stripVitePreloadFromChunk } from "../../vite-plugins/strip-who-scroll-preload.mjs";

describe("stripVitePreloadFromChunk", () => {
  it("leaves unrelated code unchanged", () => {
    const code = `import { x } from "./a.js";\nconsole.log(x);\n`;
    expect(stripVitePreloadFromChunk(code)).toBe(code);
  });

  it("removes mapDeps line, preload runtime, and unwraps who-arch dynamic import (PageVisualEdit-style)", () => {
    const before = [
      `const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/who-arch-backdrop.x.js","_astro/three.y.js"])))=>i.map(i=>d[i]);`,
      `import { r as reactExports } from "./react-vendor.js";`,
      `function MarqueeStripVisual() { return null; }`,
      `const scriptRel = /* @__PURE__ */ (function detectScriptRel() {`,
      `  const relList = typeof document !== "undefined" && document.createElement("link").relList;`,
      `  return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";`,
      `})();`,
      `const assetsURL = function(dep) { return "/" + dep; };`,
      `const seen = {};`,
      `const __vitePreload = function preload(baseModule, deps, importerUrl) {`,
      `  return Promise.resolve().then(() => baseModule());`,
      `};`,
      `let gen = 0;`,
      `function setupWhoArchBackdrop() {`,
      `  void (async () => {`,
      `    const mod = await __vitePreload(() => import("./who-arch-backdrop.BnnCQDAm.js"), true ? __vite__mapDeps([0,1]) : void 0);`,
      `    mod.mount();`,
      `  })();`,
      `}`,
    ].join("\n");

    const after = stripVitePreloadFromChunk(before);

    expect(after).not.toContain("__vite__mapDeps");
    expect(after).not.toContain("__vitePreload");
    expect(after).not.toContain("const scriptRel");
    expect(after).toContain(`await import("./who-arch-backdrop.BnnCQDAm.js")`);
    expect(after).toContain(`import { r as reactExports } from "./react-vendor.js";`);
    expect(after).toContain("function MarqueeStripVisual");
  });

  it("unwraps void 0 second argument if present", () => {
    const before =
      'const mod = await __vitePreload(() => import("./x.y.js"), void 0);';
    const after = stripVitePreloadFromChunk(before);
    expect(after).toBe('const mod = await import("./x.y.js");');
  });

  it("unwraps multiline __vitePreload with vite-ignore comment (PageVisualEdit / Netlify)", () => {
    const before = [
      `const mod = await __vitePreload(() => import(`,
      `        /* @vite-ignore */`,
      `        "./who-arch-backdrop.BnnCQDAm.js"`,
      `      ), true ? __vite__mapDeps([0,1]) : void 0);`,
    ].join("\n");
    const after = stripVitePreloadFromChunk(before);
    expect(after).toBe(`const mod = await import("./who-arch-backdrop.BnnCQDAm.js");`);
  });
});

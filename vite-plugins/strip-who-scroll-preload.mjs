/**
 * Vite injects __vitePreload + __vite__mapDeps into dynamic-import chunks. A follow-up
 * esbuild pass on Netlify intermittently failed to parse that helper (`Syntax error "d"`).
 * Strip the helper from the who-scroll client chunk and keep a plain dynamic import().
 */
export default function stripWhoScrollPreload() {
  return {
    name: "strip-who-scroll-preload",
    enforce: "post",
    apply: "build",
    generateBundle(_options, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk") continue;
        if (!chunk.fileName.includes("who-scroll-client")) continue;
        let { code } = chunk;
        if (!code.includes("__vitePreload")) continue;
        code = code.replace(/^[\s\S]*?(?=let gen = 0)/, "");
        code = code.replace(
          /const mod = await __vitePreload\(\(\) => import\("(\.\/[^"]+)"\),.*?\);/,
          'const mod = await import("$1");',
        );
        chunk.code = code;
      }
    },
  };
}

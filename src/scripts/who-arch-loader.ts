/**
 * Isolates `import()` from the Astro island chunk so Vite’s `__vitePreload` runtime
 * lives in this small file only (avoids Netlify’s esbuild choking on the island bundle).
 */
export function importWhoArchBackdropModule(): Promise<typeof import('./who-arch-backdrop')> {
  return import(/* @vite-ignore */ './who-arch-backdrop');
}

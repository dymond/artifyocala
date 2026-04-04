const loadWhoArchBackdrop = import.meta.glob<typeof import('./who-arch-backdrop')>(
  './who-arch-backdrop.ts',
);

/**
 * Lazy-load via `import.meta.glob` so Vite emits a real async chunk without wrapping
 * it in `__vitePreload` (Netlify’s esbuild pass chokes on that helper).
 */
export function importWhoArchBackdropModule(): Promise<typeof import('./who-arch-backdrop')> {
  const load = loadWhoArchBackdrop['./who-arch-backdrop.ts'];
  if (!load) {
    return Promise.reject(new Error('who-arch-backdrop module missing from glob map'));
  }
  return load();
}

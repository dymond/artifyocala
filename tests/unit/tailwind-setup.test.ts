import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');

describe('Tailwind CSS + Astro integration', () => {
  it('declares tailwindcss and @tailwindcss/vite dependencies', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const all = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(all.tailwindcss).toBeDefined();
    expect(all['@tailwindcss/vite']).toBeDefined();
  });

  it('enables the Tailwind Vite plugin in astro.config', () => {
    const cfg = readFileSync(resolve(root, 'astro.config.mjs'), 'utf8');
    expect(cfg).toMatch(/@tailwindcss\/vite/);
    expect(cfg).toMatch(/tailwindcss\(\)/);
    expect(cfg).toMatch(/vite:\s*\{/s);
  });

  it('imports Tailwind in global.css', () => {
    const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
    expect(css).toMatch(/@import\s+["']tailwindcss["']/);
    expect(css).toMatch(/@theme\s*\{/);
    expect(css).toMatch(/@utility\s+site-container/);
  });

  it('exposes twilight brand color in @theme', () => {
    const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
    expect(css).toMatch(/--color-twilight:\s*#1b1b38/);
  });

  it('exposes surge-ink for purple button shadows', () => {
    const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
    expect(css).toMatch(/--color-surge-ink:\s*color-mix/);
  });

  it('exposes cta-fill for primary button background', () => {
    const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');
    expect(css).toMatch(/--color-cta-fill:\s*color-mix/);
  });
});

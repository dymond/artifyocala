import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');

/**
 * Ensures shared CTA controls use the same “press into the hard shadow” motion
 * (positive translate + shrinking shadow + active:shadow-none).
 */
describe('Button.astro depress interaction', () => {
  const src = readFileSync(resolve(root, 'src/components/ui/Button.astro'), 'utf8');

  const depressActive = 'active:translate-x-1 active:translate-y-1 active:shadow-none';

  it('includes depress active state on primary, ghost, surge, and outline tones', () => {
    const hits = src.match(
      new RegExp(depressActive.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
    );
    expect(hits?.length).toBe(4);
  });

  it('defines a solid surge (purple) tone with matching hard shadow', () => {
    const surgeBranch =
      src.split("tone === 'surge'")[1]?.split(": 'border-2 border-ink bg-mist")[0] ?? '';
    expect(surgeBranch).toContain('bg-surge');
    expect(surgeBranch).toContain('var(--color-surge-ink)');
  });

  it('gives ghost tone a hard shadow and hover shrink like outline', () => {
    const ghostBranch =
      src.split("tone === 'ghost'")[1]?.split("tone === 'surge'")[0] ?? '';
    expect(ghostBranch).toContain('shadow-[3px_3px_0_0_var(--color-ink)]');
    expect(ghostBranch).toContain('hover:translate-x-0.5 hover:translate-y-0.5');
    expect(ghostBranch).toContain('hover:shadow-[1px_1px_0_0_var(--color-ink)]');
  });

  it('uses surge border and shadow on outline for dark surfaces', () => {
    const outlineBranch = src.split("border-2 border-ink bg-mist text-ink shadow-")[1] ?? '';
    expect(outlineBranch).toContain('[.dark-surface_&]:border-surge');
    expect(outlineBranch).toContain('[.dark-surface_&]:shadow-[3px_3px_0_0_var(--color-surge)]');
  });

  it('uses surge border and shadow for primary on dark surfaces', () => {
    const primaryBranch = src.split("tone === 'primary'")[1]?.split("tone === 'ghost'")[0] ?? '';
    expect(primaryBranch).toContain('[.dark-surface_&]:border-surge');
    expect(primaryBranch).toContain('[.dark-surface_&]:shadow-[4px_4px_0_0_var(--color-surge)]');
  });
});

describe('Header wheel nav links', () => {
  it('use depress-into-shadow hover like outline buttons', () => {
    const header = readFileSync(resolve(root, 'src/components/layout/Header.astro'), 'utf8');
    expect(header).toMatch(/hover:translate-x-0\.5 hover:translate-y-0\.5/);
    expect(header).toMatch(/hover:shadow-\[1px_1px_0_0_var\(--color-ink\)\]/);
    expect(header).not.toMatch(/hover:-translate-x-px hover:-translate-y-px/);
  });
});

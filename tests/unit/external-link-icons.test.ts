import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');

describe('external link affordances', () => {
  it('renders an opens-new-window icon from Button when external is true', () => {
    const btn = readFileSync(resolve(root, 'src/components/ui/Button.astro'), 'utf8');
    expect(btn).toMatch(/\{external &&/);
    expect(btn).toMatch(/IconExternalLink/);
    expect(btn).toMatch(/h-4 w-4/);
    expect(btn.indexOf('IconExternalLink')).toBeLessThan(btn.indexOf('<slot'));
  });

  it('uses platform icons for social links in the footer, not the external-link glyph', () => {
    const footer = readFileSync(resolve(root, 'src/components/layout/Footer.astro'), 'utf8');
    expect(footer).toMatch(/IconFacebook/);
    expect(footer).toMatch(/IconInstagram/);
    expect(footer).not.toMatch(/IconExternalLink/);
    expect(footer).not.toMatch(/\(Facebook\)/);
  });
});

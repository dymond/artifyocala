/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { isExcludedFromStudioDamage } from '../../src/lib/site-messy-damage';

describe('site-messy-damage', () => {
  it('excludes canvas, chrome wrapper, and document roots', () => {
    const chrome = document.createElement('div');
    chrome.setAttribute('data-artify-studio-chrome', '');
    const inner = document.createElement('span');
    chrome.appendChild(inner);

    const canvas = document.createElement('canvas');
    canvas.id = 'artify-messy-canvas';

    expect(isExcludedFromStudioDamage(canvas)).toBe(true);
    expect(isExcludedFromStudioDamage(chrome)).toBe(true);
    expect(isExcludedFromStudioDamage(inner)).toBe(true);
    expect(isExcludedFromStudioDamage(document.documentElement)).toBe(true);
    expect(isExcludedFromStudioDamage(document.body)).toBe(true);
  });

  it('allows normal content elements', () => {
    const main = document.createElement('main');
    const p = document.createElement('p');
    expect(isExcludedFromStudioDamage(main)).toBe(false);
    expect(isExcludedFromStudioDamage(p)).toBe(false);
  });
});

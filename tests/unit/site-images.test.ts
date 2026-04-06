import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  brickGlamGallery,
  img,
  storytellingKnightsGallery,
} from '../../src/lib/site-images';

const publicRoot = resolve(import.meta.dirname, '../../public');

function assertPublicFile(urlPath: string) {
  const rel = urlPath.replace(/^\//, '');
  expect(existsSync(resolve(publicRoot, rel))).toBe(true);
}

describe('site-images', () => {
  it('maps every img key to an existing public file', () => {
    for (const src of Object.values(img)) {
      expect(src).toMatch(/^\/images\//);
      assertPublicFile(src);
    }
  });

  it('lists seventeen Brick City Glam gallery images on disk', () => {
    expect(brickGlamGallery).toHaveLength(17);
    for (const src of brickGlamGallery) {
      assertPublicFile(src);
    }
  });

  it('maps Storytelling Knights gallery entries to existing public files', () => {
    expect(storytellingKnightsGallery.length).toBeGreaterThan(0);
    for (const src of storytellingKnightsGallery) {
      expect(src).toMatch(/^\/images\//);
      assertPublicFile(src);
    }
  });
});

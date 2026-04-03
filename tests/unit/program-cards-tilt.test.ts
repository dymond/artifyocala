import { describe, it, expect } from 'vitest';
import { mountProgramCardsTilt } from '../../src/scripts/program-cards-tilt';

describe('program-cards-tilt', () => {
  it('returns destroyable handle in non-browser (SSR / Vitest node)', () => {
    const h = mountProgramCardsTilt();
    expect(() => h.destroy()).not.toThrow();
  });
});

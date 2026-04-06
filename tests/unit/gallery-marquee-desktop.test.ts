import { describe, expect, it } from 'vitest';
import {
  measureMarqueeTrackSegmentWidth,
  segmentFillsContainer,
  shouldUseDualDesktopRows,
} from '../../src/scripts/gallery-marquee-desktop';

describe('gallery-marquee-desktop', () => {
  it('segmentFillsContainer respects epsilon', () => {
    expect(segmentFillsContainer(100, 100)).toBe(true);
    expect(segmentFillsContainer(98, 100, 2)).toBe(true);
    expect(segmentFillsContainer(97, 100, 2)).toBe(false);
    expect(segmentFillsContainer(10, 0)).toBe(false);
  });

  it('shouldUseDualDesktopRows requires both rows to fill', () => {
    expect(shouldUseDualDesktopRows(1200, 1200, 1200)).toBe(true);
    expect(shouldUseDualDesktopRows(800, 1200, 1200)).toBe(false);
    expect(shouldUseDualDesktopRows(1200, 800, 1200)).toBe(false);
  });

  it('measureMarqueeTrackSegmentWidth returns 0 for null', () => {
    expect(measureMarqueeTrackSegmentWidth(null)).toBe(0);
  });
});

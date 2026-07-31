import { describe, expect, it } from 'vitest';
import { PRODUCERS, colorMap, producerLabels } from '../utils/colorMap';

describe('colorMap', () => {
  it('has a color and label for every producer', () => {
    for (const p of PRODUCERS) {
      expect(colorMap[p]).toMatch(/^#/);
      expect(producerLabels[p].length).toBeGreaterThan(0);
    }
  });
});

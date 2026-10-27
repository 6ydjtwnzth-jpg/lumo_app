import { describe, expect, it } from 'vitest';
import { distanceMeters } from '../src/domain/geo';
import { portSchema } from '../src/domain/schema';
import napoli from '../src/data/ports/napoli.json';

describe('port data', () => {
  const port = portSchema.parse(napoli);
  it('has places within 4 km of the terminal (a walkable half day)', () => {
    for (const poi of port.pois) {
      expect(distanceMeters(port.terminal.coords, poi.coords), poi.id).toBeLessThan(4000);
    }
  });
  it('keeps summaries short enough for a phone card', () => {
    for (const poi of port.pois) {
      expect(poi.summary.it.length, poi.id).toBeLessThanOrEqual(140);
      expect(poi.summary.en.length, poi.id).toBeLessThanOrEqual(140);
    }
  });
  it('offers some hidden places', () => {
    expect(port.pois.filter((p) => p.hidden).length).toBeGreaterThanOrEqual(3);
  });
});

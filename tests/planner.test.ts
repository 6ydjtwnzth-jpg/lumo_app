import { describe, expect, it } from 'vitest';
import { planTour, placeValue } from '../src/domain/planner';
import { PORTS } from '../src/data/ports';

const port = PORTS.napoli;
const base = { port, startMin: 9 * 60 + 40, allAboardMin: 15 * 60 + 30, interests: {} };

describe('planTour', () => {
  it('always brings the guest back before the safe deadline', () => {
    for (const hours of [1, 2, 3, 4, 5, 8]) {
      const plan = planTour({ ...base, maxTourMinutes: hours * 60 });
      expect(plan.backAtTerminalMin).toBeLessThanOrEqual(plan.mustBeBackMin);
      expect(plan.backAtTerminalMin).toBeLessThanOrEqual(base.startMin + hours * 60);
      expect(plan.marginMin).toBeGreaterThanOrEqual(0);
    }
  });

  it('never repeats a place and keeps times in order', () => {
    const plan = planTour({ ...base, maxTourMinutes: 300 });
    const ids = plan.stops.map((s) => s.poi.id);
    expect(new Set(ids).size).toBe(ids.length);
    let t = base.startMin;
    for (const s of plan.stops) {
      expect(s.arriveMin).toBe(t + s.walkFromPrevMin);
      expect(s.leaveMin).toBe(s.arriveMin + s.poi.visitMinutes);
      t = s.leaveMin;
    }
  });

  it('returns an empty tour when there is no time', () => {
    const plan = planTour({ ...base, startMin: 15 * 60, maxTourMinutes: 240 });
    expect(plan.stops).toHaveLength(0);
  });

  it('follows the guest interests', () => {
    const foodie = planTour({ ...base, maxTourMinutes: 240, interests: { cibo: 2, arte: 0, storia: 0, panorami: 0, chiese: 0 } });
    const viewer = planTour({ ...base, maxTourMinutes: 240, interests: { panorami: 2, cibo: 0, arte: 0, storia: 0, chiese: 0 } });
    const count = (p: typeof foodie, cat: string) => p.stops.filter((s) => s.poi.category === cat).length;
    expect(count(foodie, 'cibo')).toBeGreaterThan(count(viewer, 'cibo'));
    expect(count(viewer, 'panorami')).toBeGreaterThan(count(foodie, 'panorami'));
  });

  it('values hidden places more for guests who love hidden places', () => {
    const hidden = port.pois.find((p) => p.hidden)!;
    expect(placeValue(hidden, { nascosti: 2 })).toBeGreaterThan(placeValue(hidden, { nascosti: 0 }));
  });
});

import { describe, expect, it } from 'vitest';
import { boxOf, clampView, cluster, fitView, insidePolygon, makeProjection, toScreen, zoomAt } from '../src/domain/map';
import { PORTS } from '../src/data/ports';
import { distanceMeters } from '../src/domain/geo';

describe('projection', () => {
  const origin = { lat: 40.84, lng: 14.25 };
  const proj = makeProjection(origin);

  it('puts the origin at 0,0 with north up and east right', () => {
    expect(proj.point(origin)).toEqual({ x: 0, y: 0 });
    expect(proj.point({ lat: 40.85, lng: 14.25 }).y).toBeLessThan(0);
    expect(proj.point({ lat: 40.84, lng: 14.26 }).x).toBeGreaterThan(0);
  });

  it('keeps distances close to the real ones (within 1%)', () => {
    const a = { lat: 40.8377, lng: 14.2562 };
    const b = { lat: 40.8536, lng: 14.2508 };
    const pa = proj.point(a), pb = proj.point(b);
    const flat = Math.hypot(pa.x - pb.x, pa.y - pb.y);
    expect(Math.abs(flat - distanceMeters(a, b)) / distanceMeters(a, b)).toBeLessThan(0.01);
  });
});

describe('view math', () => {
  const box = { minX: -500, maxX: 500, minY: -1000, maxY: 1000 };

  it('fits a box inside the viewport, centred', () => {
    const v = fitView(box, 400, 600, 20);
    const tl = toScreen({ x: box.minX, y: box.minY }, v);
    const br = toScreen({ x: box.maxX, y: box.maxY }, v);
    expect(tl.y).toBeCloseTo(20);
    expect(br.y).toBeCloseTo(580);
    expect((tl.x + br.x) / 2).toBeCloseTo(200);
  });

  it('honours uneven padding (room for the map buttons)', () => {
    const v = fitView(box, 400, 600, { top: 20, right: 80, bottom: 20, left: 20 });
    const br = toScreen({ x: box.maxX, y: box.maxY }, v);
    expect(br.x).toBeLessThanOrEqual(320 + 1e-6);
  });

  it('zooms around the finger without moving the point under it', () => {
    const v = fitView(box, 400, 600);
    const before = { x: (120 - v.tx) / v.k, y: (300 - v.ty) / v.k };
    const z = zoomAt(v, 2, 120, 300, 0, 10);
    const after = toScreen(before, z);
    expect(after.x).toBeCloseTo(120);
    expect(after.y).toBeCloseTo(300);
    expect(z.k).toBeCloseTo(v.k * 2);
  });

  it('respects zoom limits', () => {
    const v = { k: 1, tx: 0, ty: 0 };
    expect(zoomAt(v, 100, 0, 0, 0.5, 3).k).toBe(3);
    expect(zoomAt(v, 0.01, 0, 0, 0.5, 3).k).toBe(0.5);
  });

  it('keeps the screen centre inside the map', () => {
    const v = clampView({ k: 1, tx: 99_999, ty: -99_999 }, box, 400, 600);
    const centre = { x: (200 - v.tx) / v.k, y: (300 - v.ty) / v.k };
    expect(centre.x).toBeGreaterThanOrEqual(box.minX - 1e-6);
    expect(centre.y).toBeLessThanOrEqual(box.maxY + 1e-6);
  });

  it('grows a single-point box so it can still be fitted', () => {
    const b = boxOf([{ x: 10, y: 10 }], 400);
    expect(b.maxX - b.minX).toBe(400);
  });
});

describe('cluster', () => {
  it('groups nearby pins and keeps the first as leader', () => {
    const groups = cluster(
      [
        { item: 'a', at: { x: 0, y: 0 } },
        { item: 'b', at: { x: 10, y: 10 } },
        { item: 'c', at: { x: 200, y: 0 } },
      ],
      44,
    );
    expect(groups.map((g) => g.items)).toEqual([['a', 'b'], ['c']]);
  });
});

describe('Naples map data', () => {
  const port = PORTS.napoli!;
  const proj = makeProjection(port.terminal.coords);
  const sea = port.map.sea.map((p) => proj.pair(p));
  const islands = port.map.islands.map((poly) => poly.map((p) => proj.pair(p)));
  const inSea = (c: { lat: number; lng: number }) => {
    const pt = proj.point(c);
    return insidePolygon(pt, sea) && !islands.some((poly) => insidePolygon(pt, poly));
  };

  it('every place is on land and inside the map bounds', () => {
    const { north, south, east, west } = port.map.bounds;
    for (const poi of port.pois) {
      const { lat, lng } = poi.coords;
      expect(lat < north && lat > south && lng < east && lng > west, poi.id).toBe(true);
      expect(inSea(poi.coords), `${poi.id} is in the sea`).toBe(false);
    }
  });

  it('the cruise terminal is on land, at the water', () => {
    expect(inSea(port.terminal.coords)).toBe(false);
  });
});

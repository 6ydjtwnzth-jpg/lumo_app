import type { Coords, LatLng } from './schema';

/** Flat "world" coordinates in metres, x to the east and y to the south. */
export interface Point { x: number; y: number }
export interface Box { minX: number; minY: number; maxX: number; maxY: number }
/** screen = world × k + (tx, ty) */
export interface View { k: number; tx: number; ty: number }

const M_PER_DEG_LAT = 110_540;
const M_PER_DEG_LNG = 111_320;

/** Equirectangular projection around an origin: accurate enough for a few km of city. */
export function makeProjection(origin: Coords) {
  const cos = Math.cos((origin.lat * Math.PI) / 180);
  return {
    point(c: Coords): Point {
      return { x: (c.lng - origin.lng) * M_PER_DEG_LNG * cos, y: (origin.lat - c.lat) * M_PER_DEG_LAT };
    },
    pair([lat, lng]: LatLng): Point {
      return this.point({ lat, lng });
    },
  };
}

export function boxOf(points: Point[], minSize = 0): Box {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  // Grow tiny boxes (one or two points) so the view never zooms in absurdly.
  const growX = Math.max(0, minSize - (maxX - minX)) / 2;
  const growY = Math.max(0, minSize - (maxY - minY)) / 2;
  return { minX: minX - growX, maxX: maxX + growX, minY: minY - growY, maxY: maxY + growY };
}

export type Padding = number | { top: number; right: number; bottom: number; left: number };

/** The view that shows the whole box inside a width×height viewport, with padding in pixels. */
export function fitView(box: Box, width: number, height: number, padding: Padding = 32): View {
  const p = typeof padding === 'number' ? { top: padding, right: padding, bottom: padding, left: padding } : padding;
  const w = Math.max(1, box.maxX - box.minX);
  const h = Math.max(1, box.maxY - box.minY);
  const innerW = Math.max(1, width - p.left - p.right);
  const innerH = Math.max(1, height - p.top - p.bottom);
  const k = Math.max(1e-6, Math.min(innerW / w, innerH / h));
  return {
    k,
    tx: p.left + innerW / 2 - ((box.minX + box.maxX) / 2) * k,
    ty: p.top + innerH / 2 - ((box.minY + box.maxY) / 2) * k,
  };
}

/** Zoom by `factor` keeping the screen point (px, py) still, within [minK, maxK]. */
export function zoomAt(view: View, factor: number, px: number, py: number, minK: number, maxK: number): View {
  const k = Math.min(maxK, Math.max(minK, view.k * factor));
  const r = k / view.k;
  return { k, tx: px - (px - view.tx) * r, ty: py - (py - view.ty) * r };
}

/** Keep the centre of the screen inside the map, so the user can never get lost in empty space. */
export function clampView(view: View, box: Box, width: number, height: number): View {
  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b));
  return {
    k: view.k,
    tx: clamp(view.tx, width / 2 - box.maxX * view.k, width / 2 - box.minX * view.k),
    ty: clamp(view.ty, height / 2 - box.maxY * view.k, height / 2 - box.minY * view.k),
  };
}

export const toScreen = (p: Point, v: View): Point => ({ x: p.x * v.k + v.tx, y: p.y * v.k + v.ty });

export interface Cluster<T> { x: number; y: number; items: T[] }

/**
 * Greedy screen-space clustering: items closer than `radius` pixels to an
 * existing group join it. Items come in priority order, so the first one
 * (e.g. the selected place) always leads its group.
 */
export function cluster<T>(items: { item: T; at: Point }[], radius: number): Cluster<T>[] {
  const groups: Cluster<T>[] = [];
  for (const { item, at } of items) {
    const near = groups.find((g) => Math.hypot(g.x - at.x, g.y - at.y) < radius);
    if (near) near.items.push(item);
    else groups.push({ x: at.x, y: at.y, items: [item] });
  }
  return groups;
}

/** Ray-casting test, used to scatter trees inside parks. */
export function insidePolygon(p: Point, poly: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i]!, b = poly[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

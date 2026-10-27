import type { Coords } from './schema';

const EARTH_RADIUS_M = 6_371_000;
// Streets are never straight lines: assume the walked route is ~30% longer.
const DETOUR = 1.3;
// Relaxed tourist pace, about 4.5 km/h.
const WALK_M_PER_MIN = 75;

export function distanceMeters(a: Coords, b: Coords): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

/** Estimated walking time in whole minutes (at least 1 when the places differ). */
export function walkMinutes(a: Coords, b: Coords): number {
  const meters = distanceMeters(a, b) * DETOUR;
  if (meters < 1) return 0;
  return Math.max(1, Math.ceil(meters / WALK_M_PER_MIN));
}

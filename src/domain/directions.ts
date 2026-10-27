import type { Coords } from './schema';

export type TravelMode = 'walking' | 'transit';

const pt = (c: Coords) => `${c.lat},${c.lng}`;

/** Opens turn-by-turn directions in Google Maps (works on any phone, app or browser). */
export function googleMapsUrl(from: Coords | null, to: Coords, mode: TravelMode = 'walking'): string {
  const params = new URLSearchParams({ api: '1', destination: pt(to), travelmode: mode });
  if (from) params.set('origin', pt(from));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Same in Apple Maps, for iPhone users who prefer it. */
export function appleMapsUrl(from: Coords | null, to: Coords, mode: TravelMode = 'walking'): string {
  const params = new URLSearchParams({ daddr: pt(to), dirflg: mode === 'walking' ? 'w' : 'r' });
  if (from) params.set('saddr', pt(from));
  return `https://maps.apple.com/?${params.toString()}`;
}

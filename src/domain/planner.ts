import { walkMinutes } from './geo';
import type { Category, Coords, Poi, Port } from './schema';
import type { Minutes } from './time';

/** 0 = not interested, 1 = medium, 2 = a lot. */
export type Level = 0 | 1 | 2;
export type Interests = Partial<Record<Category, Level>>;

export interface PlanInput {
  port: Port;
  /** When the guest starts walking from the terminal. */
  startMin: Minutes;
  /** "All aboard" time announced by the ship. */
  allAboardMin: Minutes;
  /** How long the guest wants to be out (the tour may end earlier). */
  maxTourMinutes: Minutes;
  interests: Interests;
  /** Extra cushion on top of the boarding controls. */
  safetyMinutes?: Minutes;
}

export interface PlannedStop {
  poi: Poi;
  walkFromPrevMin: Minutes;
  arriveMin: Minutes;
  leaveMin: Minutes;
}

export interface Plan {
  stops: PlannedStop[];
  walkBackMin: Minutes;
  /** When the guest is expected back at the terminal. */
  backAtTerminalMin: Minutes;
  /** Latest moment to be at the terminal to board calmly. */
  mustBeBackMin: Minutes;
  /** Minutes of margin between expected return and the latest safe return. */
  marginMin: Minutes;
}

export const DEFAULT_SAFETY_MIN = 20;

/** How much a place is worth to this guest; never zero so the tour is never empty by taste alone. */
export function placeValue(poi: Poi, interests: Interests): number {
  const byCategory = interests[poi.category] ?? 1;
  const hiddenBonus = poi.hidden ? (interests.nascosti ?? 1) * 0.75 : 0;
  return 0.3 + byCategory * 1.5 + hiddenBonus;
}

/**
 * Greedy planner: from where the guest stands, pick the place with the best
 * value per minute spent (walk + visit) that still lets them walk back to the
 * terminal before the deadline. Repeat until nothing else fits.
 */
export function planTour(input: PlanInput): Plan {
  const { port, startMin, allAboardMin, maxTourMinutes, interests } = input;
  const safety = input.safetyMinutes ?? DEFAULT_SAFETY_MIN;
  const terminal = port.terminal.coords;
  const mustBeBackMin = allAboardMin - port.controlsMinutes - safety;
  const endMin = Math.min(startMin + maxTourMinutes, mustBeBackMin);

  const stops: PlannedStop[] = [];
  const used = new Set<string>();
  let here: Coords = terminal;
  let now = startMin;

  for (;;) {
    let best: { stop: PlannedStop; score: number } | null = null;
    for (const poi of port.pois) {
      if (used.has(poi.id)) continue;
      const walk = walkMinutes(here, poi.coords);
      const arrive = now + walk;
      const leave = arrive + poi.visitMinutes;
      if (leave + walkMinutes(poi.coords, terminal) > endMin) continue;
      const score = placeValue(poi, interests) / (walk + poi.visitMinutes);
      if (!best || score > best.score || (score === best.score && poi.id < best.stop.poi.id)) {
        best = { stop: { poi, walkFromPrevMin: walk, arriveMin: arrive, leaveMin: leave }, score };
      }
    }
    if (!best) break;
    stops.push(best.stop);
    used.add(best.stop.poi.id);
    here = best.stop.poi.coords;
    now = best.stop.leaveMin;
  }

  const walkBackMin = walkMinutes(here, terminal);
  const backAtTerminalMin = now + walkBackMin;
  return {
    stops,
    walkBackMin,
    backAtTerminalMin,
    mustBeBackMin,
    marginMin: mustBeBackMin - backAtTerminalMin,
  };
}

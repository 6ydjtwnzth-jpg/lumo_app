import { useEffect, useMemo, useState } from 'react';
import { walkMinutes } from '../domain/geo';
import { planTour, type Interests, type Plan } from '../domain/planner';
import { returnStatus, type ReturnStatus } from '../domain/returnStatus';
import type { Category, Coords, Port } from '../domain/schema';
import { minutesOfDay, parseHHMM, toInputTime, type Minutes } from '../domain/time';
import type { Lang } from '../i18n';
import { storage } from '../lib/storage';

export type Screen = 'esplora' | 'arrivo' | 'giro' | 'tappa' | 'timer';

interface Saved {
  lang: Lang;
  start: string;
  allAboard: string;
  hours: number;
  interests: Interests;
  /** The guest has asked for a walk at least once. */
  planned: boolean;
  started: boolean;
  demoOffset: Minutes;
}

const roundTo10 = (m: Minutes) => Math.round(m / 10) * 10;

function defaults(): Saved {
  const now = minutesOfDay(new Date());
  const lang: Lang = typeof navigator !== 'undefined' && navigator.language.startsWith('it') ? 'it' : 'en';
  return {
    lang,
    start: toInputTime(roundTo10(now)),
    allAboard: toInputTime(roundTo10(now + 350)),
    hours: 4,
    interests: {},
    planned: false,
    started: false,
    demoOffset: 0,
  };
}

/** "All aboard" after midnight still counts as later the same evening. */
function aboardAfter(start: Minutes, aboard: Minutes): Minutes {
  return aboard <= start ? aboard + 1440 : aboard;
}

export interface CruiseState extends Saved {
  screen: Screen;
  /** Where the place detail was opened from, for the back button. */
  from: Screen;
  poiId: string | null;
  startMin: Minutes;
  allAboardMin: Minutes;
  availableMin: Minutes;
  maxHours: number;
  plan: Plan;
  nowMin: Minutes;
  position: Coords | null;
  /** Where we think the guest is: GPS if allowed, otherwise the current stop of the tour. */
  estimatedPosition: Coords;
  walkBackMin: Minutes;
  status: ReturnStatus;
}

export interface CruiseActions {
  go(screen: Screen, poiId?: string): void;
  setLang(lang: Lang): void;
  setStart(value: string): void;
  setAllAboard(value: string): void;
  setHours(hours: number): void;
  toggleInterest(category: Category): void;
  planTour(): void;
  startTour(): void;
  demoForward(): void;
  locate(): void;
}

export function useCruise(port: Port): [CruiseState, CruiseActions] {
  const [saved, setSaved] = useState<Saved>(() => {
    const merged = { ...defaults(), ...storage.get<Partial<Saved>>('cruise', {}) };
    // Old or hand-edited values are normalised so the time inputs never show blank.
    return {
      ...merged,
      start: toInputTime(parseHHMM(merged.start) ?? 0),
      allAboard: toInputTime(parseHHMM(merged.allAboard) ?? 0),
    };
  });
  const [screen, setScreen] = useState<Screen>(saved.started ? 'timer' : 'arrivo');
  const [poiId, setPoiId] = useState<string | null>(null);
  const [from, setFrom] = useState<Screen>('esplora');
  const [position, setPosition] = useState<Coords | null>(null);
  const [clock, setClock] = useState(() => minutesOfDay(new Date()));

  useEffect(() => storage.set('cruise', saved), [saved]);

  useEffect(() => {
    const id = setInterval(() => setClock(minutesOfDay(new Date())), 10_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.documentElement.lang = saved.lang;
  }, [saved.lang]);

  const startMin = parseHHMM(saved.start) ?? 0;
  const allAboardMin = aboardAfter(startMin, parseHHMM(saved.allAboard) ?? startMin);
  const availableMin = allAboardMin - startMin;
  const maxHours = Math.max(1, Math.min(6, Math.floor((availableMin - port.controlsMinutes - 20) / 60)));
  const hours = Math.min(saved.hours, maxHours);

  const plan = useMemo(
    () => planTour({ port, startMin, allAboardMin, maxTourMinutes: hours * 60, interests: saved.interests }),
    [port, startMin, allAboardMin, hours, saved.interests],
  );

  // Before the planned start (e.g. setting things up on board) the clock runs from the start time.
  let base = clock;
  if (base < startMin - 720) base += 1440;
  if (saved.started && base < startMin) base = startMin;
  const nowMin = base + saved.demoOffset;

  const currentStop = [...plan.stops].reverse().find((s) => s.arriveMin <= nowMin);
  const estimatedPosition = position ?? currentStop?.poi.coords ?? port.terminal.coords;
  const walkBackMin = estimatedPosition === port.terminal.coords ? 0 : walkMinutes(estimatedPosition, port.terminal.coords);
  const status = returnStatus({ nowMin, allAboardMin, walkBackMin, controlsMinutes: port.controlsMinutes });

  const patch = (p: Partial<Saved>) => setSaved((s) => ({ ...s, ...p }));

  const actions: CruiseActions = {
    go(next, id) {
      if (next === 'tappa' && screen !== 'tappa') setFrom(screen);
      setScreen(next);
      if (id !== undefined) setPoiId(id);
      window.scrollTo({ top: 0 });
    },
    setLang: (lang) => patch({ lang }),
    setStart: (start) => parseHHMM(start) != null && patch({ start, started: false, demoOffset: 0 }),
    setAllAboard: (allAboard) => parseHHMM(allAboard) != null && patch({ allAboard, started: false }),
    setHours: (h) => patch({ hours: h }),
    // A chosen interest weighs double; the others still count, so the walk is never empty.
    toggleInterest: (category) =>
      setSaved((s) => {
        const interests = { ...s.interests };
        if (interests[category] === 2) delete interests[category];
        else interests[category] = 2;
        return { ...s, interests, started: false };
      }),
    planTour() {
      patch({ planned: true });
      actions.go('giro');
    },
    startTour() {
      patch({ started: true, demoOffset: 0 });
      actions.go('timer');
    },
    demoForward: () => setSaved((s) => ({ ...s, demoOffset: s.demoOffset + 30 })),
    locate() {
      navigator.geolocation?.getCurrentPosition(
        (p) => setPosition({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => setPosition(null),
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
      );
    },
  };

  const state: CruiseState = {
    ...saved,
    hours,
    screen,
    from,
    poiId,
    startMin,
    allAboardMin,
    availableMin,
    maxHours,
    plan,
    nowMin,
    position,
    estimatedPosition,
    walkBackMin,
    status,
  };
  return [state, actions];
}

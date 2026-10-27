import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  boxOf, clampView, cluster, fitView, insidePolygon, makeProjection, toScreen, zoomAt,
  type Box, type Point, type View,
} from '../domain/map';
import type { Coords, Poi, Port } from '../domain/schema';
import { dict, t, type Lang } from '../i18n';
import { Icon } from './Icon';
import { loc } from './ui';

export interface MapPin {
  poi: Poi;
  /** Position in the tour, shown as a badge. */
  number?: number;
}

interface Props {
  port: Port;
  lang: Lang;
  pins: MapPin[];
  /** What the map frames when it opens (and when the user taps "centre"). */
  fit: Coords[];
  label: string;
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Walking order, drawn as a dotted line. */
  route?: Coords[];
  you?: Coords | null;
  interactive?: boolean;
  small?: boolean;
  className?: string;
  /** Pixels at the bottom covered by a card: a selected pin is moved out from under it. */
  bottomInset?: number;
}

const CLUSTER_PX = 58;
const CLUSTER_NUMBER_PX = 30;
const CLUSTER_SMALL_PX = 40;
/** A name sits under its pin, so it needs free space mostly to the sides. */
const LABEL_SPACE = { x: 170, y: 80 };
const MIN_FIT_M = 350;

const pathOf = (pts: Point[], close: boolean) =>
  pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('') + (close ? 'Z' : '');

/** Small deterministic noise, so trees and waves stay put between renders. */
const noise = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453;
  return s - Math.floor(s);
};

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export function MapView(props: Props) {
  const { port, lang, pins, fit, selectedId, onSelect, route, you, interactive = true, small = false } = props;
  const d = dict(lang);
  const [ref, { w, h }] = useSize<HTMLDivElement>();
  const proj = useMemo(() => makeProjection(port.terminal.coords), [port]);

  // Static artwork, in world metres.
  const art = useMemo(() => {
    const m = port.map;
    const poly = (p: [number, number][]) => p.map((c) => proj.pair(c));
    const sea = poly(m.sea);
    const islands = m.islands.map(poly);
    const parks = m.parks.map(poly);
    const world: Box = boxOf([
      proj.point({ lat: m.bounds.north, lng: m.bounds.west }),
      proj.point({ lat: m.bounds.south, lng: m.bounds.east }),
    ]);

    const trees: { x: number; y: number; r: number }[] = [];
    parks.forEach((park, pi) => {
      const b = boxOf(park);
      let i = 0;
      for (let y = b.minY + 30; y < b.maxY; y += 55) {
        for (let x = b.minX + 30; x < b.maxX; x += 55) {
          const n = pi * 1000 + i++;
          const p = { x: x + (noise(n) - 0.5) * 30, y: y + (noise(n + 7) - 0.5) * 30 };
          if (noise(n + 3) > 0.45 && insidePolygon(p, park)) trees.push({ ...p, r: 11 + noise(n + 5) * 9 });
        }
      }
    });

    const waves: Point[] = [];
    let i = 0;
    for (let y = world.minY; y < world.maxY + 600; y += 260) {
      for (let x = world.minX - 300; x < world.maxX + 300; x += 340) {
        const p = { x: x + (i % 2) * 170 + (noise(i) - 0.5) * 80, y: y + (noise(i + 1) - 0.5) * 60 };
        i++;
        if (insidePolygon(p, sea) && !islands.some((isl) => insidePolygon(p, isl))) waves.push(p);
      }
    }

    return {
      world,
      sea: pathOf(sea, true),
      islands: islands.map((p) => pathOf(p, true)),
      parks: parks.map((p) => pathOf(p, true)),
      squares: m.squares.map((p) => pathOf(poly(p), true)),
      main: m.streets.filter((s) => s.main).map((s) => pathOf(poly(s.path), false)),
      minor: m.streets.filter((s) => !s.main).map((s) => pathOf(poly(s.path), false)),
      labels: m.labels.map((l) => ({ ...l, p: proj.pair(l.at) })),
      trees,
      waves,
    };
  }, [port, proj]);

  const terminal = proj.point(port.terminal.coords);
  const fitKey = fit.map((c) => `${c.lat},${c.lng}`).join('|');
  const fitBox = useMemo(() => boxOf(fit.map((c) => proj.point(c)), MIN_FIT_M), [fitKey, proj]);

  const limits = useMemo(() => {
    const kAll = w && h ? fitView(art.world, w, h, 0).k : 0.1;
    return { min: kAll * 0.9, max: kAll * 7, labels: kAll * 2.2 };
  }, [art.world, w, h]);

  const home = useCallback(
    (): View => {
      // Leave room on the right for the zoom buttons and at the bottom for the place card.
      const pad = small ? 34 : interactive ? { top: 56, right: 76, bottom: 56, left: 44 } : 56;
      const v = fitView(fitBox, w, h, pad);
      return clampView({ ...v, k: Math.min(limits.max, Math.max(limits.min, v.k)) }, art.world, w, h);
    },
    [fitBox, w, h, small, interactive, limits, art.world],
  );

  const [view, setView] = useState<View | null>(null);
  useEffect(() => {
    if (w && h) setView(home());
  }, [home, w, h]);

  const apply = useCallback((v: View) => setView(clampView(v, art.world, w, h)), [art.world, w, h]);

  // Bring a newly selected place into the free part of the map.
  const bottomInset = props.bottomInset ?? 0;
  useEffect(() => {
    if (!selectedId) return;
    const poi = port.pois.find((p) => p.id === selectedId);
    if (!poi) return;
    setView((v) => {
      if (!v) return v;
      const at = toScreen(proj.point(poi.coords), v);
      const top = 90, bottom = h - bottomInset - 60, side = 50;
      const dx = at.x < side ? side - at.x : at.x > w - side - 60 ? w - side - 60 - at.x : 0;
      const dy = at.y < top ? top - at.y : at.y > bottom ? bottom - at.y : 0;
      return dx || dy ? { ...v, tx: v.tx + dx, ty: v.ty + dy } : v;
    });
  }, [selectedId, port, proj, w, h, bottomInset]);

  // --- gestures: one finger pans, two fingers pinch, wheel and keys zoom ---
  const pointers = useRef(new Map<number, Point>());
  const dragged = useRef(false);
  const downAt = useRef<Point>({ x: 0, y: 0 });

  const local = (e: { clientX: number; clientY: number }): Point => {
    const r = ref.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 1) {
      dragged.current = false;
      downAt.current = p;
    }
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev || !view) return;
    const p = local(e);
    if (!dragged.current && Math.hypot(p.x - downAt.current.x, p.y - downAt.current.y) < 6 && pointers.current.size === 1) return;
    if (!dragged.current) {
      dragged.current = true;
      ref.current?.setPointerCapture(e.pointerId);
    }
    if (pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.entries()].filter(([id]) => id !== e.pointerId).map(([, v]) => v);
      const other = a ?? b!;
      const before = Math.hypot(prev.x - other.x, prev.y - other.y) || 1;
      const after = Math.hypot(p.x - other.x, p.y - other.y) || 1;
      const mid = { x: (p.x + other.x) / 2, y: (p.y + other.y) / 2 };
      const z = zoomAt(view, after / before, mid.x, mid.y, limits.min, limits.max);
      apply({ ...z, tx: z.tx + (p.x - prev.x) / 2, ty: z.ty + (p.y - prev.y) / 2 });
    } else {
      apply({ ...view, tx: view.tx + p.x - prev.x, ty: view.ty + p.y - prev.y });
    }
    pointers.current.set(e.pointerId, p);
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || !interactive) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      setView((v) => v && clampView(zoomAt(v, Math.exp(-e.deltaY * 0.0022), e.clientX - r.left, e.clientY - r.top, limits.min, limits.max), art.world, w, h));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [interactive, limits, art.world, w, h, ref]);

  const zoomBy = (f: number) => view && apply(zoomAt(view, f, w / 2, h / 2, limits.min, limits.max));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!view || e.target !== e.currentTarget) return;
    const step = 60;
    const moves: Record<string, [number, number]> = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
    const mv = moves[e.key];
    if (mv) apply({ ...view, tx: view.tx + mv[0], ty: view.ty + mv[1] });
    else if (e.key === '+' || e.key === '=') zoomBy(1.4);
    else if (e.key === '-') zoomBy(1 / 1.4);
    else return;
    e.preventDefault();
  };

  // --- pins, grouped when they would overlap ---
  const numbered = pins.some((p) => p.number != null);
  const { groups, selectedPin } = useMemo(() => {
    if (!view) return { groups: [], selectedPin: null };
    // The selected place is never hidden inside a group.
    const sel = pins.find((p) => p.poi.id === selectedId) ?? null;
    const rest = pins
      .filter((p) => p !== sel)
      .sort((a, b) => (a.number ?? (a.poi.hidden ? 500 : 100)) - (b.number ?? (b.poi.hidden ? 500 : 100)));
    const radius = numbered ? CLUSTER_NUMBER_PX : small ? CLUSTER_SMALL_PX : CLUSTER_PX;
    const gs = cluster(rest.map((p) => ({ item: p, at: toScreen(proj.point(p.poi.coords), view) })), radius);
    return { groups: gs, selectedPin: sel && { pin: sel, at: toScreen(proj.point(sel.poi.coords), view) } };
  }, [pins, view, selectedId, proj, small, numbered]);

  const roomForLabel = (x: number, y: number) =>
    groups.every((g) => (g.x === x && g.y === y) || Math.abs(g.x - x) > LABEL_SPACE.x || Math.abs(g.y - y) > LABEL_SPACE.y);

  const zoomTo = (coords: Coords[]) => {
    const v = fitView(boxOf(coords.map((c) => proj.point(c)), 450), w, h, { top: 70, right: 80, bottom: 70, left: 60 });
    apply({ ...v, k: Math.min(limits.max, Math.max(limits.min, v.k)) });
  };

  const showLabels = !!view && view.k >= limits.labels;

  function renderPin(pin: MapPin, x: number, y: number, selected: boolean) {
    const name = loc(pin.poi.name, lang);
    const aria = `${pin.number != null ? `${pin.number}. ` : ''}${name}, ${d.categories[pin.poi.category]}${pin.poi.hidden ? `, ${d.hidden}` : ''}`;
    if (pin.number != null) {
      return (
        <button
          key={pin.poi.id}
          type="button"
          className="pin-dot"
          style={{ left: x, top: y }}
          aria-label={aria}
          tabIndex={onSelect ? 0 : -1}
          onClick={() => onSelect?.(pin.poi.id)}
        >
          {pin.number}
        </button>
      );
    }
    const label = selected || (showLabels && !small && roomForLabel(x, y));
    return (
      <div key={pin.poi.id} className={`pin-wrap ${selected ? 'is-selected' : ''}`} style={{ left: x, top: y }}>
        <button
          type="button"
          className="pin"
          aria-pressed={onSelect ? selected : undefined}
          aria-label={aria}
          tabIndex={onSelect ? 0 : -1}
          onClick={() => onSelect?.(pin.poi.id)}
        >
          <Icon name={pin.poi.icon} size={selected ? 46 : small ? 26 : 34} />
          {pin.poi.hidden && (
            <span className="pin-gem" aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" /></svg>
            </span>
          )}
        </button>
        {label && <span className="pin-label">{name}</span>}
      </div>
    );
  }
  const routePath = route && route.length > 1 ? pathOf(route.map((c) => proj.point(c)), false) : null;

  return (
    <div
      ref={ref}
      className={`map ${small ? 'map-small' : ''} ${interactive ? 'is-interactive' : ''} ${props.className ?? ''}`}
      role="region"
      aria-label={props.label}
      tabIndex={interactive ? 0 : -1}
      onKeyDown={interactive ? onKeyDown : undefined}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={(e) => {
        if (!interactive || !view || e.target !== e.currentTarget.querySelector('svg')) return;
        const p = local(e);
        apply(zoomAt(view, 1.8, p.x, p.y, limits.min, limits.max));
      }}
      onClick={(e) => {
        const onPin = (e.target as HTMLElement).closest('button');
        if (!dragged.current && !onPin) onSelect?.(null);
      }}
    >
      {view && (
        <>
          <svg className="map-base" width={w} height={h} aria-hidden="true">
            <rect width={w} height={h} className="m-ground" />
            <g transform={`translate(${view.tx} ${view.ty}) scale(${view.k})`}>
              <path d={art.sea} className="m-sea" />
              <g className="m-wave">
                {art.waves.map((p, i) => (
                  <path key={i} d={`M${p.x - 32} ${p.y}c10 -9 21 9 32 0s21 -9 32 0`} vectorEffect="non-scaling-stroke" />
                ))}
              </g>
              {art.islands.map((p, i) => <path key={i} d={p} className="m-ground" />)}
              {art.parks.map((p, i) => <path key={i} d={p} className="m-park" />)}
              <g className="m-tree">{art.trees.map((t, i) => <circle key={i} cx={t.x} cy={t.y} r={t.r} />)}</g>
              {art.squares.map((p, i) => <path key={i} d={p} className="m-square" />)}
              <g className="m-street-minor">{art.minor.map((p, i) => <path key={i} d={p} vectorEffect="non-scaling-stroke" />)}</g>
              <g className="m-street">{art.main.map((p, i) => <path key={i} d={p} vectorEffect="non-scaling-stroke" />)}</g>
              {routePath && <path d={routePath} className="m-route" vectorEffect="non-scaling-stroke" />}
            </g>
          </svg>

          {!small && art.labels.map((l, i) => {
            const s = toScreen(l.p, view);
            return (
              <span key={i} className={`map-label map-label-${l.kind}`} style={{ left: s.x, top: s.y }} aria-hidden="true">
                {loc(l.text, lang)}
              </span>
            );
          })}

          <ShipPin at={toScreen(terminal, view)} label={d.ship} small={small} />

          {groups.map((g) => {
            const lead = g.items[0]!;
            if (g.items.length > 1) {
              const names = g.items.map((x) => loc(x.poi.name, lang)).join(', ');
              return (
                <button
                  key={`c-${lead.poi.id}`}
                  type="button"
                  className={`pin-cluster ${numbered ? 'is-numbered' : ''}`}
                  style={{ left: g.x, top: g.y }}
                  aria-label={`${t(lang, 'placesHere', { n: g.items.length })}: ${names}`}
                  tabIndex={interactive ? 0 : -1}
                  onClick={() => interactive && zoomTo(g.items.map((x) => x.poi.coords))}
                >
                  {numbered ? (
                    <span className="pin-dot-stack">{g.items.map((x) => x.number).join('·')}</span>
                  ) : (
                    <>
                      <Icon name={lead.poi.icon} size={small ? 26 : 34} />
                      <span className="pin-count">{g.items.length}</span>
                    </>
                  )}
                </button>
              );
            }
            return renderPin(lead, g.x, g.y, false);
          })}

          {selectedPin && renderPin(selectedPin.pin, selectedPin.at.x, selectedPin.at.y, true)}

          {you && (() => {
            const s = toScreen(proj.point(you), view);
            return <span className="you-dot" role="img" aria-label={d.youAreHere} style={{ left: s.x, top: s.y }} />;
          })()}

          {interactive && (
            <div className="map-controls">
              <button type="button" onClick={() => zoomBy(1.5)} aria-label={d.zoomIn}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
              </button>
              <button type="button" onClick={() => zoomBy(1 / 1.5)} aria-label={d.zoomOut}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>
              </button>
              <button type="button" onClick={() => setView(home())} aria-label={d.recenter}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" /></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ShipPin({ at, label, small }: { at: Point; label: string; small: boolean }) {
  return (
    <span className="ship-pin" role="img" aria-label={label} style={{ left: at.x, top: at.y }}>
      <Icon name="nave" size={small ? 30 : 40} />
    </span>
  );
}

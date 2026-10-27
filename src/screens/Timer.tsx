import { Icon } from '../components/Icon';
import { MapView } from '../components/MapView';
import { loc, WalkIcon } from '../components/ui';
import { appleMapsUrl, googleMapsUrl } from '../domain/directions';
import type { ReturnLevel } from '../domain/returnStatus';
import type { Port } from '../domain/schema';
import { formatDuration, formatHHMM } from '../domain/time';
import { dict, t } from '../i18n';
import type { CruiseActions, CruiseState } from '../state/useCruise';

const STATUS_KEYS = {
  ok: ['statusOk', 'statusOkText'],
  soon: ['statusSoon', 'statusSoonText'],
  now: ['statusNow', 'statusNowText'],
  late: ['statusLate', 'statusLateText'],
} as const satisfies Record<ReturnLevel, readonly [string, string]>;

// Each level has its own shape too, so the meaning never relies on colour alone.
function StatusGlyph({ level }: { level: ReturnLevel }) {
  const paths: Record<ReturnLevel, string> = {
    ok: 'M6 12.5l4 4 8-9',
    soon: 'M12 7.5V12l3 2M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z',
    now: 'M5 12h12M13 7l5 5-5 5',
    late: 'M12 6v7M12 17.5v.5',
  };
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[level]} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Timer({ port, s, a }: { port: Port; s: CruiseState; a: CruiseActions }) {
  const d = dict(s.lang);
  const { status } = s;
  const [titleKey, textKey] = STATUS_KEYS[status.level];
  const total = Math.max(1, s.allAboardMin - s.startMin);
  const fraction = Math.min(1, Math.max(0, status.minutesToAllAboard / total));
  const R = 110;
  const C = 2 * Math.PI * R;
  const next = s.plan.stops.find((x) => x.arriveMin > s.nowMin);
  const terminal = port.terminal.coords;
  const atPort = s.walkBackMin === 0;

  return (
    <div className={`night night-${status.level}`}>
      <main className="screen night-screen">
        <div className="night-head">
          <span className="eyebrow">{d.allAboard} {formatHHMM(s.allAboardMin)}</span>
          <span className="night-soft">{t(s.lang, 'nowIs', { time: formatHHMM(s.nowMin) })}</span>
        </div>

        <section className="ring-wrap" aria-label={`${d.left} ${formatDuration(status.minutesToAllAboard)} ${d.toAllAboard}`}>
          <svg className="ring" viewBox="0 0 260 260" aria-hidden="true">
            <circle cx="130" cy="130" r={R} className="ring-track" />
            <circle
              cx="130" cy="130" r={R}
              className={`ring-fill ring-${status.level}`}
              strokeDasharray={C}
              strokeDashoffset={C * (1 - fraction)}
              transform="rotate(-90 130 130)"
            />
          </svg>
          <div className="ring-text" aria-hidden="true">
            <span>{d.left}</span>
            <b>{formatDuration(status.minutesToAllAboard)}</b>
            <span>{d.toAllAboard}</span>
          </div>
        </section>

        <section className={`status status-${status.level}`} role="status" aria-live="polite">
          <span className="status-icon"><StatusGlyph level={status.level} /></span>
          <span className="stack-2">
            <b>{d[titleKey]}</b>
            <span>{t(s.lang, textKey, { time: formatDuration(status.freeMin) })}</span>
          </span>
        </section>

        <section className="night-row">
          <span className="tile tile-sky"><Icon name="nave" size={34} /></span>
          <span className="stack-2">
            <b>{atPort ? d.atPort : t(s.lang, 'walkBack', { n: s.walkBackMin })}</b>
            <span className="night-soft">
              {t(s.lang, 'leaveBy', { time: formatHHMM(status.leaveByMin) })} · {s.position ? d.positionOn : d.positionEstimated}
            </span>
          </span>
        </section>

        {!atPort && (
          <MapView
            className="mini-map night-map"
            port={port}
            lang={s.lang}
            label={d.returnMap}
            pins={[]}
            fit={[s.estimatedPosition, terminal]}
            route={[s.estimatedPosition, terminal]}
            you={s.estimatedPosition}
            interactive={false}
            small
          />
        )}

        <a className="cta cta-sun" href={googleMapsUrl(s.position, terminal)} target="_blank" rel="noreferrer">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11 21 3l-8 18-2-8z" /></svg>
          {d.takeMeToShip}
        </a>
        <div className="row">
          <a className="ghost ghost-night" href={appleMapsUrl(s.position, terminal)} target="_blank" rel="noreferrer">Apple Maps</a>
          <button type="button" className="ghost ghost-night" onClick={a.locate}>{d.useMyPosition}</button>
        </div>

        {next && (
          <button type="button" className="night-row night-next" onClick={() => a.go('tappa', next.poi.id)}>
            <span className="tile tile-violet"><Icon name={next.poi.icon} size={34} /></span>
            <span className="stack-2">
              <span className="night-soft">{d.nextStop} · {formatHHMM(next.arriveMin)}</span>
              <b>{loc(next.poi.name, s.lang)}</b>
            </span>
          </button>
        )}

        <button type="button" className="demo" onClick={a.demoForward}>
          <WalkIcon /> {d.demoForward}
        </button>
        <p className="note night-soft">{d.disclaimer}</p>
      </main>
    </div>
  );
}

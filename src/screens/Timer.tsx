import { Icon } from '../components/Icon';
import { loc, TopBar, WalkIcon } from '../components/ui';
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
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
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
  const R = 88;
  const C = 2 * Math.PI * R;
  const next = s.plan.stops.find((x) => x.arriveMin > s.nowMin);
  const terminal = port.terminal.coords;

  return (
    <>
      <TopBar title={d.timerTitle} onBack={() => a.go('giro')} backLabel={d.back} />
      <main className="screen">
        <section className="ring-wrap" aria-label={`${d.left} ${formatDuration(status.minutesToAllAboard)} ${d.toAllAboard}`}>
          <svg className="ring" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r={R} className="ring-track" />
            <circle
              cx="100" cy="100" r={R}
              className={`ring-fill ring-${status.level}`}
              strokeDasharray={C}
              strokeDashoffset={C * (1 - fraction)}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="ring-text" aria-hidden="true">
            <span className="muted">{d.left}</span>
            <b>{formatDuration(status.minutesToAllAboard)}</b>
            <span className="muted">{d.toAllAboard} · {formatHHMM(s.allAboardMin)}</span>
          </div>
        </section>

        <section className={`status status-${status.level}`} role="status" aria-live="polite">
          <StatusGlyph level={status.level} />
          <div>
            <b>{d[titleKey]}</b>
            <p>{t(s.lang, textKey, { time: formatDuration(status.freeMin) })}</p>
          </div>
        </section>

        <ul className="facts">
          <li><Icon name="orologio" size={28} /> {t(s.lang, 'leaveBy', { time: formatHHMM(status.leaveByMin) })}</li>
          <li><WalkIcon size={22} /> {s.walkBackMin === 0 ? d.atPort : t(s.lang, 'walkBack', { n: s.walkBackMin })}</li>
          <li className="muted">{s.position ? d.positionOn : d.positionEstimated}</li>
        </ul>

        <a className="cta" href={googleMapsUrl(s.position, terminal)} target="_blank" rel="noreferrer">
          <Icon name="nave" size={28} /> {d.takeMeToShip}
        </a>
        <div className="row">
          <a className="ghost" href={appleMapsUrl(s.position, terminal)} target="_blank" rel="noreferrer">Apple Maps</a>
          <button type="button" className="ghost" onClick={a.locate}>{d.useMyPosition}</button>
        </div>

        {next && (
          <button type="button" className="stop" onClick={() => a.go('tappa', next.poi.id)}>
            <span className="stop-icon"><Icon name={next.poi.icon} size={44} /></span>
            <span className="stop-body">
              <span className="stop-time">{d.nextStop} · {formatHHMM(next.arriveMin)}</span>
              <b className="stop-name">{loc(next.poi.name, s.lang)}</b>
            </span>
          </button>
        )}

        <button type="button" className="chip demo" onClick={a.demoForward}>{d.demoForward}</button>
        <p className="note">{d.disclaimer}</p>
      </main>
    </>
  );
}

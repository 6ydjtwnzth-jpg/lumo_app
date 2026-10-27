import { Icon } from '../components/Icon';
import { Badge, loc, TopBar, WalkIcon } from '../components/ui';
import type { Port } from '../domain/schema';
import { formatDuration, formatHHMM } from '../domain/time';
import { dict, t } from '../i18n';
import type { CruiseActions, CruiseState } from '../state/useCruise';

export function Giro({ port, s, a }: { port: Port; s: CruiseState; a: CruiseActions }) {
  const d = dict(s.lang);
  const { plan } = s;

  return (
    <>
      <TopBar title={d.tourTitle} onBack={() => a.go('arrivo')} backLabel={d.back} />
      <main className="screen">
        {plan.stops.length === 0 ? (
          <p className="card">{d.noTime}</p>
        ) : (
          <>
            <section className="summary">
              <Badge tone="mint">{t(s.lang, 'backAt', { time: formatHHMM(plan.backAtTerminalMin) })}</Badge>
              <Badge>{t(s.lang, 'margin', { time: formatDuration(plan.marginMin) })}</Badge>
            </section>

            <ol className="timeline">
              <li className="tl-point">
                <span className="tl-icon"><Icon name="nave" size={32} /></span>
                <span>
                  <b>{loc(port.terminal.name, s.lang)}</b>
                  <span className="muted"> · {formatHHMM(s.startMin)}</span>
                </span>
              </li>
              {plan.stops.map((stop) => (
                <li key={stop.poi.id}>
                  <p className="tl-walk">
                    <WalkIcon /> {t(s.lang, 'walk', { n: stop.walkFromPrevMin })}
                  </p>
                  <button type="button" className="stop" onClick={() => a.go('tappa', stop.poi.id)}>
                    <span className="stop-icon"><Icon name={stop.poi.icon} size={44} /></span>
                    <span className="stop-body">
                      <span className="stop-time">
                        {formatHHMM(stop.arriveMin)}–{formatHHMM(stop.leaveMin)}
                      </span>
                      <b className="stop-name">{loc(stop.poi.name, s.lang)}</b>
                      <span className="stop-tags">
                        <Badge>{d.categories[stop.poi.category]}</Badge>
                        {stop.poi.hidden && <Badge tone="mint">{d.hidden}</Badge>}
                        {stop.poi.ticket.required && <Badge tone="sun">{d.ticket}</Badge>}
                      </span>
                    </span>
                    <svg className="chev" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </li>
              ))}
              <li>
                <p className="tl-walk">
                  <WalkIcon /> {t(s.lang, 'walk', { n: plan.walkBackMin })}
                </p>
                <div className="tl-point">
                  <span className="tl-icon"><Icon name="nave" size={32} /></span>
                  <span>
                    <b>{t(s.lang, 'backAt', { time: formatHHMM(plan.backAtTerminalMin) })}</b>
                    <span className="muted"> · {d.allAboard} {formatHHMM(s.allAboardMin)}</span>
                  </span>
                </div>
              </li>
            </ol>

            <button type="button" className="cta" onClick={a.startTour}>
              {d.startTour}
            </button>
          </>
        )}
        <button type="button" className="ghost" onClick={() => a.go('arrivo')}>
          {d.edit}
        </button>
        <p className="note">{d.disclaimer}</p>
      </main>
    </>
  );
}

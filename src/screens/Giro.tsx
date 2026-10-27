import { Icon } from '../components/Icon';
import { MapView } from '../components/MapView';
import { Badge, loc, PageHeader, WalkIcon } from '../components/ui';
import { CATEGORIES, type Port } from '../domain/schema';
import { formatDuration, formatHHMM } from '../domain/time';
import { dict, t } from '../i18n';
import type { CruiseActions, CruiseState } from '../state/useCruise';

export function Giro({ port, s, a }: { port: Port; s: CruiseState; a: CruiseActions }) {
  const d = dict(s.lang);
  const { plan } = s;
  const chosen = CATEGORIES.filter((c) => s.interests[c] === 2).map((c) => d.categories[c].toLowerCase());
  const subtitle = [t(s.lang, 'tourSub', { city: loc(port.city, s.lang) }), chosen.join(', ')].filter(Boolean).join(' · ');
  const route = [port.terminal.coords, ...plan.stops.map((x) => x.poi.coords), port.terminal.coords];

  const tourMin = Math.max(1, plan.backAtTerminalMin - s.startMin);
  const marginMin = Math.max(0, s.allAboardMin - plan.backAtTerminalMin);

  return (
    <div className="page">
      <PageHeader title={t(s.lang, 'tourFor', { n: s.hours })} subtitle={subtitle} onBack={() => a.go('arrivo')} backLabel={d.edit} />
      <main className="screen">
        {plan.stops.length === 0 ? (
          <p className="card">{d.noTime}</p>
        ) : (
          <>
            <section className="card stack-10">
              <div
                className="timebar"
                role="img"
                aria-label={t(s.lang, 'timeline', {
                  start: formatHHMM(s.startMin),
                  back: formatHHMM(plan.backAtTerminalMin),
                  margin: formatDuration(marginMin),
                  aboard: formatHHMM(s.allAboardMin),
                })}
              >
                <span className="timebar-walk" style={{ flex: tourMin }} />
                <span className="timebar-margin" style={{ flex: marginMin }} />
              </div>
              <div className="timebar-legend">
                <span>{formatHHMM(s.startMin)} {d.departure}</span>
                <span>{formatHHMM(plan.backAtTerminalMin)} {d.atPortShort}</span>
                <span className="accent">{formatHHMM(s.allAboardMin)} {d.allAboardShort}</span>
              </div>
              <span className="ok-text">{t(s.lang, 'margin', { time: formatDuration(plan.marginMin) })}</span>
            </section>

            <MapView
              className="tour-map"
              port={port}
              lang={s.lang}
              label={d.tourMap}
              pins={plan.stops.map((x, i) => ({ poi: x.poi, number: i + 1 }))}
              fit={route}
              route={route}
              onSelect={(id) => id && a.go('tappa', id)}
            />

            <ol className="stops" aria-label={d.stops}>
              {plan.stops.map((stop, i) => (
                <li key={stop.poi.id}>
                  <p className="walk-link">
                    <span className="dots" aria-hidden="true" />
                    <WalkIcon /> {t(s.lang, 'walk', { n: stop.walkFromPrevMin })}
                  </p>
                  <button type="button" className="stop" onClick={() => a.go('tappa', stop.poi.id)}>
                    <span className="tile tile-violet">
                      <Icon name={stop.poi.icon} size={36} />
                      <span className="tile-number">{i + 1}</span>
                    </span>
                    <span className="stop-body">
                      <b>{loc(stop.poi.name, s.lang)}</b>
                      <span className="stop-note">{loc(stop.poi.summary, s.lang)}</span>
                      <span className="tags">
                        {stop.poi.hidden && <Badge tone="sun">{d.hidden}</Badge>}
                        {stop.poi.ticket.required && <Badge>{d.ticket}</Badge>}
                      </span>
                    </span>
                    <span className="stop-time">{formatHHMM(stop.arriveMin)}</span>
                  </button>
                </li>
              ))}
              <li>
                <p className="walk-link">
                  <span className="dots" aria-hidden="true" />
                  <WalkIcon /> {t(s.lang, 'walk', { n: plan.walkBackMin })}
                </p>
                <div className="stop stop-ship">
                  <span className="tile tile-sky"><Icon name="nave" size={36} /></span>
                  <span className="stop-body">
                    <b>{loc(port.terminal.name, s.lang)}</b>
                    <span className="stop-note">{d.allAboard} {formatHHMM(s.allAboardMin)}</span>
                  </span>
                  <span className="stop-time">{formatHHMM(plan.backAtTerminalMin)}</span>
                </div>
              </li>
            </ol>
            <p className="note">{d.disclaimer}</p>
          </>
        )}
      </main>

      <div className="action-bar row">
        <button type="button" className="ghost" onClick={() => a.go('arrivo')}>{d.edit}</button>
        {plan.stops.length > 0 && (
          <button type="button" className="cta grow-2" onClick={s.started ? () => a.go('timer') : a.startTour}>
            {s.started ? d.openTimer : d.startTour}
          </button>
        )}
      </div>
    </div>
  );
}

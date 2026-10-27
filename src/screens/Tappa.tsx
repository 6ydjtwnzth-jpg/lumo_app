import { Icon } from '../components/Icon';
import { Badge, loc, TopBar, WalkIcon } from '../components/ui';
import { appleMapsUrl, googleMapsUrl } from '../domain/directions';
import type { Port } from '../domain/schema';
import { dict, t } from '../i18n';
import type { CruiseActions, CruiseState } from '../state/useCruise';

export function Tappa({ port, s, a }: { port: Port; s: CruiseState; a: CruiseActions }) {
  const d = dict(s.lang);
  const index = s.plan.stops.findIndex((x) => x.poi.id === s.poiId);
  const stop = s.plan.stops[index];
  const poi = stop?.poi ?? port.pois.find((p) => p.id === s.poiId);
  if (!poi) return null;

  // Directions start from the previous stop of the tour (or the terminal), or from GPS when allowed.
  const from = s.position ?? (index > 0 ? s.plan.stops[index - 1]!.poi.coords : port.terminal.coords);

  return (
    <>
      <TopBar title={loc(poi.name, s.lang)} onBack={() => a.go(s.started ? 'timer' : 'giro')} backLabel={d.back} />
      <main className="screen">
        <section className="poi-hero">
          <span className="poi-icon"><Icon name={poi.icon} size={88} /></span>
          <h1>{loc(poi.name, s.lang)}</h1>
          <div className="stop-tags">
            <Badge>{d.categories[poi.category]}</Badge>
            {poi.hidden && <Badge tone="mint">{d.hidden}</Badge>}
            <Badge>{t(s.lang, 'visit', { n: poi.visitMinutes })}</Badge>
          </div>
        </section>

        <p className="lead">{loc(poi.summary, s.lang)}</p>

        {poi.localTip && (
          <section className="card tip">
            <h2><Icon name="gemma" size={24} /> {d.localTip}</h2>
            <p>{loc(poi.localTip, s.lang)}</p>
          </section>
        )}

        {poi.curiosities.length > 0 && (
          <details className="card accordion">
            <summary>
              <Icon name="curiosita" size={28} /> <span>{d.curiosities}</span>
            </summary>
            <ul>
              {poi.curiosities.map((c) => <li key={c.it}>{loc(c, s.lang)}</li>)}
            </ul>
          </details>
        )}

        {poi.ticket.required && (
          <section className="card">
            <h2>{d.ticket}</h2>
            {poi.ticket.note && <p>{loc(poi.ticket.note, s.lang)}</p>}
          </section>
        )}

        {!poi.verified && <p className="note warn">{d.toVerify}</p>}

        <section className="directions">
          <h2>{d.directions}</h2>
          {stop && (
            <p className="muted"><WalkIcon /> {t(s.lang, 'walk', { n: stop.walkFromPrevMin })}</p>
          )}
          <div className="row">
            <a className="cta" href={googleMapsUrl(from, poi.coords)} target="_blank" rel="noreferrer">Google Maps</a>
            <a className="ghost" href={appleMapsUrl(from, poi.coords)} target="_blank" rel="noreferrer">Apple Maps</a>
          </div>
        </section>
      </main>
    </>
  );
}

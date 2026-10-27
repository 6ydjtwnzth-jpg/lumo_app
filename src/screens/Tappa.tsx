import { Icon } from '../components/Icon';
import { MapView } from '../components/MapView';
import { Badge, BackButton, Hills, loc, WalkIcon } from '../components/ui';
import { appleMapsUrl, googleMapsUrl } from '../domain/directions';
import { walkMinutes } from '../domain/geo';
import type { Port } from '../domain/schema';
import { dict, t } from '../i18n';
import type { CruiseActions, CruiseState } from '../state/useCruise';

export function Tappa({ port, s, a }: { port: Port; s: CruiseState; a: CruiseActions }) {
  const d = dict(s.lang);
  const index = s.plan.stops.findIndex((x) => x.poi.id === s.poiId);
  const poi = port.pois.find((p) => p.id === s.poiId);
  if (!poi) return null;

  // Directions start from GPS when allowed, otherwise from the previous stop of the walk or the ship.
  const from = s.position ?? (index > 0 ? s.plan.stops[index - 1]!.poi.coords : port.terminal.coords);
  const walk = walkMinutes(from, poi.coords);

  return (
    <div className="page">
      <div className="place-hero">
        <Hills height={210} />
        <span className="place-icon"><Icon name={poi.icon} size={140} /></span>
        <span className="place-back"><BackButton onClick={() => a.go(s.from)} label={d.back} /></span>
      </div>

      <main className="sheet">
        <div className="stack-10">
          <h1>{loc(poi.name, s.lang)}</h1>
          <div className="tags">
            <Badge>{d.categories[poi.category]}</Badge>
            {poi.hidden && <Badge tone="sun">{d.hidden}</Badge>}
            <Badge>{t(s.lang, 'visit', { n: poi.visitMinutes })}</Badge>
          </div>
        </div>

        <p className="lead">{loc(poi.summary, s.lang)}</p>

        {poi.localTip && (
          <section className="tip-card">
            <span className="tile tile-mint"><Icon name="gemma" size={30} /></span>
            <span className="stack-2">
              <b>{d.localTip}</b>
              <span>{loc(poi.localTip, s.lang)}</span>
            </span>
          </section>
        )}

        {poi.curiosities.length > 0 && (
          <details className="card accordion">
            <summary>
              <span className="tile tile-sun"><Icon name="curiosita" size={30} /></span>
              <span>{d.curiosities}</span>
            </summary>
            <ul>
              {poi.curiosities.map((c) => <li key={c.it}>{loc(c, s.lang)}</li>)}
            </ul>
          </details>
        )}

        {poi.ticket.required && (
          <section className="row-card">
            <span className="tile tile-sun"><Icon name="biglietto" size={30} /></span>
            <span className="stack-2">
              <b>{d.ticket}</b>
              {poi.ticket.note && <span className="muted">{loc(poi.ticket.note, s.lang)}</span>}
            </span>
          </section>
        )}

        <section className="stack-10">
          <h2>{d.directions}</h2>
          <MapView
            className="mini-map"
            port={port}
            lang={s.lang}
            label={d.placeMap}
            pins={[{ poi }]}
            fit={[from, poi.coords]}
            route={[from, poi.coords]}
            you={s.position}
            interactive={false}
            small
          />
          <p className="walk-line"><WalkIcon /> {t(s.lang, 'walk', { n: walk })}</p>
          <div className="row">
            <a className="cta" href={googleMapsUrl(from, poi.coords)} target="_blank" rel="noreferrer">Google Maps</a>
            <a className="ghost" href={appleMapsUrl(from, poi.coords)} target="_blank" rel="noreferrer">Apple Maps</a>
          </div>
        </section>

        {!poi.verified && <p className="note warn">{d.toVerify}</p>}
      </main>
    </div>
  );
}

import { Icon } from '../components/Icon';
import { Badge, loc, TopBar } from '../components/ui';
import { CATEGORIES, type Port } from '../domain/schema';
import type { Level } from '../domain/planner';
import { formatDuration } from '../domain/time';
import { dict, t } from '../i18n';
import type { CruiseActions, CruiseState } from '../state/useCruise';

const LEVELS: Level[] = [0, 1, 2];

export function Arrivo({ port, s, a }: { port: Port; s: CruiseState; a: CruiseActions }) {
  const d = dict(s.lang);
  const hourOptions = Array.from({ length: s.maxHours }, (_, i) => i + 1).filter((h) => h >= Math.min(2, s.maxHours));

  return (
    <>
      <TopBar
        title=""
        right={
          <button type="button" className="chip" onClick={() => a.setLang(s.lang === 'it' ? 'en' : 'it')}>
            {d.language}
          </button>
        }
      />
      <main className="screen">
        <section className="hero">
          <Badge tone="violet">
            <Icon name="nave" size={18} /> {d.cruiseMode}
          </Badge>
          <h1>{t(s.lang, 'welcome', { city: loc(port.city, s.lang) })}</h1>
          <p className="muted">{t(s.lang, 'moored', { terminal: loc(port.terminal.name, s.lang) })}</p>
        </section>

        <section className="card times">
          <label className="field">
            <span>{d.startAt}</span>
            <input type="time" value={s.start} onChange={(e) => a.setStart(e.target.value)} />
          </label>
          <label className="field">
            <span>{d.allAboard}</span>
            <input type="time" value={s.allAboard} onChange={(e) => a.setAllAboard(e.target.value)} />
          </label>
          <p className="you-have">
            <Icon name="orologio" size={28} /> {t(s.lang, 'youHave', { time: formatDuration(s.availableMin) })}
          </p>
        </section>

        <section>
          <h2>{d.howLong}</h2>
          <div className="segmented" role="group" aria-label={d.howLong}>
            {hourOptions.map((h) => (
              <button
                key={h}
                type="button"
                aria-pressed={s.hours === h}
                onClick={() => a.setHours(h)}
              >
                {h} h
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2>{d.interests}</h2>
          <ul className="interests">
            {CATEGORIES.map((c) => {
              const level = s.interests[c] ?? 1;
              return (
                <li key={c}>
                  <span className="interest-name">{d.categories[c]}</span>
                  <div className="segmented small" role="group" aria-label={d.categories[c]}>
                    {LEVELS.map((l) => (
                      <button key={l} type="button" aria-pressed={level === l} onClick={() => a.setInterest(c, l)}>
                        {d.levels[l]}
                      </button>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <button type="button" className="cta" onClick={() => a.go('giro')}>
          {t(s.lang, 'createTour', { n: s.hours })}
        </button>
        <p className="note">{d.excursions}</p>
        <p className="note">{d.disclaimer}</p>
      </main>
    </>
  );
}

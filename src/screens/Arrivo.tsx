import { Icon, Logo } from '../components/Icon';
import { CATEGORY_ICON, loc } from '../components/ui';
import { CATEGORIES, type Port } from '../domain/schema';
import { formatDuration, formatHHMM } from '../domain/time';
import { dict, t } from '../i18n';
import type { CruiseActions, CruiseState } from '../state/useCruise';

/** The bay with Vesuvius, the sun and the ship: the first thing a guest sees. */
function Bay() {
  return (
    <svg className="bay" viewBox="0 0 390 250" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <rect width="390" height="250" className="bay-sky" />
      <circle cx="292" cy="104" r="24" className="bay-sun" />
      <path d="M60 186 L150 102 L176 118 L198 94 L300 186 Z" className="bay-mountain" />
      <path d="M150 102 L163 114 L176 118 L188 102 L198 94" className="bay-line" />
      <rect y="186" width="390" height="64" className="bay-sea" />
      <path d="M0 204c20-6 40 6 60 0s40 6 60 0 40 6 60 0 40 6 60 0 40 6 60 0 40 6 60 0" className="bay-wave" />
      <path d="M0 228c20-6 40 6 60 0s40 6 60 0 40 6 60 0 40 6 60 0 40 6 60 0 40 6 60 0" className="bay-wave faint" />
    </svg>
  );
}

export function Arrivo({ port, s, a }: { port: Port; s: CruiseState; a: CruiseActions }) {
  const d = dict(s.lang);
  const hourOptions = Array.from({ length: s.maxHours }, (_, i) => i + 1).filter((h) => h >= Math.min(2, s.maxHours));
  const { plan } = s;

  return (
    <div className="arrival">
      <div className="arrival-hero">
        <Bay />
        <span className="arrival-ship"><Icon name="nave" size={120} /></span>
        <div className="arrival-pills">
          <span className="pill"><Logo size={16} /> {d.cruiseMode}</span>
          <button type="button" className="pill pill-dark" onClick={() => a.setLang(s.lang === 'it' ? 'en' : 'it')}>
            {d.language}
          </button>
        </div>
      </div>

      <main className="sheet">
        <div className="stack-4">
          <h1>{t(s.lang, 'welcome', { city: loc(port.city, s.lang) })}</h1>
          <p className="muted">{t(s.lang, 'moored', { terminal: loc(port.terminal.name, s.lang) })}</p>
        </div>

        <section className="night-card">
          <span className="tile tile-rose"><Icon name="orologio" size={40} /></span>
          <span className="stack-2">
            <span className="eyebrow">{d.allAboard} {formatHHMM(s.allAboardMin)}</span>
            <b className="night-big">{t(s.lang, 'youHave', { time: formatDuration(s.availableMin) })}</b>
          </span>
        </section>

        <section className="card times" aria-label={d.times}>
          <label className="field">
            <span>{d.startAt}</span>
            <input id="start-time" type="time" value={s.start} onChange={(e) => a.setStart(e.target.value)} />
          </label>
          <label className="field">
            <span>{d.allAboard}</span>
            <input id="aboard-time" type="time" value={s.allAboard} onChange={(e) => a.setAllAboard(e.target.value)} />
          </label>
        </section>

        <section className="stack-10">
          <h2>{d.howLong}</h2>
          <div className="segmented" role="group" aria-label={d.duration}>
            {hourOptions.map((h) => (
              <button key={h} type="button" aria-pressed={s.hours === h} onClick={() => a.setHours(h)}>
                {h} h
              </button>
            ))}
          </div>
          {plan.stops.length > 0 && (
            <p className="ok-note">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5L20 7" /></svg>
              {t(s.lang, 'planPreview', { time: formatHHMM(plan.backAtTerminalMin), margin: formatDuration(plan.marginMin) })}
            </p>
          )}
        </section>

        <section className="stack-10">
          <h2>{d.interests}</h2>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button key={c} type="button" className="interest" aria-pressed={s.interests[c] === 2} onClick={() => a.toggleInterest(c)}>
                <Icon name={CATEGORY_ICON[c]} size={24} />
                {d.categories[c]}
              </button>
            ))}
          </div>
        </section>

        <div className="row-card">
          <span className="tile tile-sun"><Icon name="nave" size={32} /></span>
          <p>{d.excursions}</p>
        </div>

        <p className="note">{d.disclaimer}</p>
      </main>

      <div className="action-bar">
        <button type="button" className="cta" onClick={a.planTour}>
          {t(s.lang, 'createTour', { n: s.hours })}
        </button>
      </div>
    </div>
  );
}

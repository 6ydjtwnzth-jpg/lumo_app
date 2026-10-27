import { useEffect, useMemo, useState } from 'react';
import { Icon, Logo } from '../components/Icon';
import { MapView } from '../components/MapView';
import { Badge, CATEGORY_ICON, Hills, loc } from '../components/ui';
import { walkMinutes } from '../domain/geo';
import { CATEGORIES, type Category, type Port } from '../domain/schema';
import { dict, t } from '../i18n';
import type { CruiseActions, CruiseState } from '../state/useCruise';

type Filter = Category | 'tutti';

export function Esplora({ port, s, a }: { port: Port; s: CruiseState; a: CruiseActions }) {
  const d = dict(s.lang);
  const [filter, setFilter] = useState<Filter>('tutti');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setShowHint(false), 4000);
    return () => clearTimeout(id);
  }, []);

  const visible = useMemo(
    () => port.pois.filter((p) => filter === 'tutti' || p.category === filter || (filter === 'nascosti' && p.hidden)),
    [port, filter],
  );
  const fit = useMemo(() => [port.terminal.coords, ...port.pois.map((p) => p.coords)], [port]);
  const selected = visible.find((p) => p.id === selectedId) ?? null;

  const tabs: { id: Filter; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
    { id: 'tutti', label: d.all, icon: 'mappa' },
    ...CATEGORIES.map((c) => ({ id: c as Filter, label: d.categories[c], icon: CATEGORY_ICON[c] })),
  ];

  return (
    <div className="explore">
      <header className="explore-header">
        <div className="explore-top">
          <span className="brand"><Logo size={24} /> <b>lumo</b></span>
          <span className="explore-city">
            <b>{loc(port.city, s.lang)}</b>
            <span>{d.cruiseMode}</span>
          </span>
          <button type="button" className="chip" onClick={() => a.setLang(s.lang === 'it' ? 'en' : 'it')}>
            {d.language}
          </button>
        </div>
        <div className="cat-tabs" role="tablist" aria-label={d.categoriesLabel}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => {
                setFilter(tab.id);
                setSelectedId(null);
              }}
            >
              <span className="cat-icon"><Icon name={tab.icon} size={34} /></span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <MapView
        className="explore-map"
        port={port}
        lang={s.lang}
        label={t(s.lang, 'mapOf', { city: loc(port.city, s.lang) })}
        pins={visible.map((poi) => ({ poi }))}
        fit={fit}
        selectedId={selectedId}
        onSelect={setSelectedId}
        you={s.position}
        bottomInset={selected ? 250 : 0}
      />

      {selected ? (
        <div className="sheet-card">
          <button type="button" className="sheet-main" onClick={() => a.go('tappa', selected.id)}>
            <span className="sheet-art">
              <Hills height={112} />
              <span className="sheet-icon"><Icon name={selected.icon} size={92} /></span>
              {selected.hidden && <span className="sheet-flag"><Badge tone="sun">{d.hidden}</Badge></span>}
            </span>
            <span className="sheet-text">
              <span className="sheet-row">
                <b className="sheet-name">{loc(selected.name, s.lang)}</b>
                <span className="sheet-cta">{d.discover} ›</span>
              </span>
              <span className="muted">
                {d.categories[selected.category]} · {t(s.lang, 'fromShip', { n: walkMinutes(port.terminal.coords, selected.coords) })}
              </span>
            </span>
          </button>
          <button type="button" className="round-btn sheet-close" aria-label={d.close} onClick={() => setSelectedId(null)}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      ) : (
        showHint && <p className="map-hint">{d.tapAPlace}</p>
      )}
    </div>
  );
}

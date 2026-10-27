import type { ReactNode } from 'react';
import type { Category, IconName, Localized } from '../domain/schema';
import type { Lang } from '../i18n';
import { dict } from '../i18n';
import type { Screen } from '../state/useCruise';

export const loc = (text: Localized, lang: Lang) => text[lang];

export const CATEGORY_ICON: Record<Category, IconName> = {
  storia: 'pantheon',
  arte: 'museo',
  natura: 'giardino',
  cibo: 'pizza',
  nascosti: 'gemma',
  panorami: 'panorama',
  chiese: 'chiesa',
};

export function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" className="round-btn" onClick={onClick} aria-label={label}>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function PageHeader({ title, subtitle, onBack, backLabel }: {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel: string;
}) {
  return (
    <header className="page-header">
      <BackButton onClick={onBack} label={backLabel} />
      <div className="page-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </header>
  );
}

export function Badge({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'mint' | 'sun' | 'violet' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function WalkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="4" r="2" fill="currentColor" />
        <path d="M10 21l2-6 3 3v3M8 12l3-4 4 2 2 3M11 8l-2 6" />
      </g>
    </svg>
  );
}

export function GemBadge() {
  return (
    <span className="gem" aria-hidden="true">
      <svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" /></svg>
    </span>
  );
}

/** Soft hills and a sun: the backdrop of every place illustration. */
export function Hills({ height = 128 }: { height?: number }) {
  return (
    <svg className="hills" width="100%" height={height} viewBox="0 0 346 128" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <circle cx="286" cy="40" r="20" className="h-sun" />
      <path d="M26 46h40a10 10 0 0 0-10-12 14 14 0 0 0-26 4 8 8 0 0 0-4 8z" className="h-cloud" />
      <path d="M0 112c40-14 90-16 140-8s110 10 206-6v30H0z" className="h-hill" />
      <path d="M62 112c-5-9-4-21 2-28 6 7 7 19 2 28z" className="h-tree" />
      <path d="M270 114c-5-9-4-21 2-28 6 7 7 19 2 28z" className="h-tree" />
    </svg>
  );
}

const NAV: { screen: Screen; key: 'explore' | 'myTour' | 'returnTab'; icon: ReactNode }[] = [
  {
    screen: 'esplora',
    key: 'explore',
    icon: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  },
  {
    screen: 'giro',
    key: 'myTour',
    icon: <><circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" /><path d="M8 19h7a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h7" /></>,
  },
  {
    screen: 'timer',
    key: 'returnTab',
    icon: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2M9 2h6" /></>,
  },
];

export function BottomNav({ lang, current, onGo }: { lang: Lang; current: Screen; onGo: (s: Screen) => void }) {
  const d = dict(lang);
  const active = current === 'arrivo' ? 'giro' : current;
  return (
    <nav className="bottom-nav" aria-label={d.mainNav}>
      {NAV.map((item) => (
        <button
          key={item.screen}
          type="button"
          aria-current={active === item.screen ? 'page' : undefined}
          onClick={() => onGo(item.screen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">{item.icon}</g>
          </svg>
          {d[item.key]}
        </button>
      ))}
    </nav>
  );
}

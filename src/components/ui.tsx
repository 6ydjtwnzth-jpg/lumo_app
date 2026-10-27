import type { ReactNode } from 'react';
import type { Localized } from '../domain/schema';
import type { Lang } from '../i18n';
import { Logo } from './Icon';

export const loc = (text: Localized, lang: Lang) => text[lang];

export function TopBar({ title, onBack, backLabel, right }: {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
}) {
  return (
    <header className="topbar">
      {onBack ? (
        <button type="button" className="icon-btn" onClick={onBack} aria-label={backLabel}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <span className="brand"><Logo size={26} /> <b>lumo</b></span>
      )}
      <span className="topbar-title">{title}</span>
      <span className="topbar-right">{right}</span>
    </header>
  );
}

export function Badge({ children, tone = 'plain' }: { children: ReactNode; tone?: 'plain' | 'mint' | 'sun' | 'violet' | 'warn' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function WalkIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="4" r="2" fill="currentColor" />
        <path d="M9 21l2.5-6.5L14 17v4M11.5 14.5 12.5 9l-4 2v3.5M12.5 9l2.5 3 3 1" />
      </g>
    </svg>
  );
}

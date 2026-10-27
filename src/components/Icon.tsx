import type { ReactNode } from 'react';
import type { IconName } from '../domain/schema';

// Illustrated Lumo icons (64x64). Colours here are illustration colours, kept
// as fixed values on purpose: the drawings look the same in light and dark mode.
const INK = '#22182E';
const W = '#FFFFFF';

const DRAWINGS: Record<IconName, ReactNode> = {
  pantheon: (
    <>
      <path d="M17 28a15 14 0 0 1 30 0z" fill="#C9B8FF" />
      <rect x="29" y="12" width="6" height="3" rx="1.5" fill={W} />
      <path d="M9 35 32 23l23 12z" fill="#FFE3A3" />
      {[12, 21.5, 31, 40.5, 48].map((x) => <rect key={x} x={x} y="35" width="5" height="15" fill="#FFF6E2" />)}
      <rect x="7" y="50" width="50" height="5" rx="2" fill="#FFE3A3" />
    </>
  ),
  museo: (
    <>
      <rect x="7" y="11" width="50" height="40" rx="5" fill="#FFD66B" />
      <rect x="13" y="17" width="38" height="28" rx="2" fill="#BFE7FF" />
      <path d="M13 45l12-14 8 9 6-6 12 11z" fill="#7ACB7A" />
      <circle cx="42" cy="25" r="4.5" fill="#FF8A5B" />
      <path d="M22 51l-3 7M42 51l3 7" fill="none" />
    </>
  ),
  chiesa: (
    <>
      <rect x="40" y="18" width="11" height="37" fill="#FFC9A8" />
      <path d="M38 18l7.5-11L53 18z" fill="#E86F4C" />
      <path d="M12 55V32l14-12 14 12v23z" fill="#FFE3D1" />
      <path d="M21 55v-9a5 5 0 0 1 10 0v9z" fill="#5B2EE5" />
      <circle cx="26" cy="33" r="4" fill="#9AD0F5" />
      <path d="M6 55h52" fill="none" />
    </>
  ),
  gemma: (
    <>
      <path d="M10 26 19 13h26l9 13-22 28z" fill="#5EE0C8" />
      <path d="M10 26h44M19 13l7 13 6 28M45 13l-7 13-6 28" fill="none" />
      <path d="M53 4l1.6 4.4L59 10l-4.4 1.6L53 16l-1.6-4.4L47 10l4.4-1.6z" fill="#FFC93C" />
    </>
  ),
  panorama: (
    <>
      <circle cx="32" cy="32" r="24" fill="#FFE1C7" />
      <circle cx="40" cy="25" r="7" fill="#FF8A5B" />
      <path d="M8.6 38C16 31 23 31 31 37s16-6 24.4-1A24 24 0 0 1 8.6 38z" fill="#8FD18F" />
      <path d="M21 47c-3.5-6-3-14 1.5-19 4.5 5 5 13 1.5 19z" fill="#3E9E5A" />
    </>
  ),
  pizza: (
    <>
      <path d="M9 15Q32 4 55 15L32 59z" fill="#FFE07A" />
      <path d="M9 15Q32 4 55 15l-3.5 7Q32 12 12.5 22z" fill="#E8A55A" />
      <circle cx="26" cy="27" r="4.5" fill="#E5484D" />
      <circle cx="38" cy="29" r="4.5" fill="#E5484D" />
      <circle cx="32" cy="41" r="4" fill="#E5484D" />
      <path d="M36 35c3-2 6-1 7 1-3 2-6 1-7-1z" fill="#3E9E5A" strokeWidth={2} />
    </>
  ),
  nave: (
    <>
      <path d="M43 12h8l-2 16h-6z" fill="#FFC93C" />
      <rect x="22" y="18" width="19" height="10" rx="1.5" fill={W} />
      <rect x="15" y="28" width="33" height="12" rx="1.5" fill={W} />
      <path d="M5 40h54l-8 13H13z" fill="#5B2EE5" />
      <path d="M3 58c4-3 8 3 12 0s8 3 12 0 8 3 12 0 8 3 12 0 8 3 10 1" fill="none" stroke="#3BA7E6" />
    </>
  ),
  orologio: (
    <>
      <circle cx="15" cy="13" r="6" fill="#FF9EBB" />
      <circle cx="49" cy="13" r="6" fill="#FF9EBB" />
      <circle cx="32" cy="35" r="21" fill="#FF9EBB" />
      <circle cx="32" cy="35" r="15" fill={W} />
      <path d="M32 26v9l6 4" fill="none" />
    </>
  ),
  curiosita: (
    <>
      <path d="M8 22h4M52 22h4M13 7l3 3M51 7l-3 3" fill="none" />
      <path d="M32 6a17 17 0 0 0-10 30.8c2 1.6 3 3.6 3 6.2v2h14v-2c0-2.6 1-4.6 3-6.2A17 17 0 0 0 32 6z" fill="#FFC93C" />
      <path d="M27 35l5-9 5 9" fill="none" />
      <rect x="24" y="45" width="16" height="6" rx="2" fill="#C9B8FF" />
      <rect x="27" y="51" width="10" height="5" rx="2.5" fill="#C9B8FF" />
    </>
  ),
  giardino: (
    <>
      <rect x="29" y="38" width="6" height="17" rx="2" fill="#B07A4F" />
      <circle cx="32" cy="27" r="19" fill="#7ACB7A" />
      {[[23, 23], [38, 18], [38, 33], [26, 35]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#FF9A3C" />)}
    </>
  ),
  fontana: (
    <>
      <path d="M32 6c3.5 5 5.5 8.5 5.5 11.5a5.5 5.5 0 0 1-11 0C26.5 14.5 28.5 11 32 6z" fill="#8ED8FA" />
      <path d="M8 35h48l-5 14H13z" fill="#9FDDF8" />
      <rect x="23" y="49" width="18" height="7" rx="2" fill="#F3E3CC" />
    </>
  ),
  gelato: (
    <>
      <path d="M21 33h22L32 59z" fill="#F4C27A" />
      <circle cx="25" cy="28" r="9" fill="#FF9EBB" />
      <circle cx="39" cy="28" r="9" fill="#A8E6C3" />
      <circle cx="32" cy="18" r="9" fill="#FFE07A" />
    </>
  ),
  torre: (
    <>
      <rect x="21" y="25" width="22" height="30" fill="#F6D2F0" />
      <path d="M17 27 32 5l15 22z" fill="#9B6BFF" />
      <path d="M27 41v-5a5 5 0 0 1 10 0v5z" fill="#5B2EE5" />
      <path d="M12 55h40" fill="none" />
    </>
  ),
  mappa: (
    <>
      <path d="M8 16l14-6 20 6 14-6v38l-14 6-20-6-14 6z" fill="#FFF1C9" />
      <path d="M22 10v38M42 16v38" fill="none" />
      <path d="M22 10l20 6v38l-20-6z" fill="#CDEBB8" />
      <path d="M32 40s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" fill="#5B2EE5" />
      <circle cx="32" cy="28" r="2.5" fill="#FFC93C" />
    </>
  ),
  biglietto: (
    <>
      <path d="M8 18h48v9a5 5 0 0 0 0 10v9H8v-9a5 5 0 0 0 0-10z" fill="#FFC93C" />
      <path d="M42 19v26" fill="none" strokeDasharray="3 4" />
      <path d="M16 28h18M16 36h12" fill="none" />
    </>
  ),
  scarpa: (
    <>
      <path d="M8 45c0-9 2-17 6-22l9 4c2 5 8 7 15 7 9 0 16 4 19 10v3H8z" fill="#9AD0F5" />
      <rect x="6" y="46" width="53" height="8" rx="4" fill={W} />
    </>
  ),
};

export function Icon({ name, size = 40 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <g stroke={INK} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round">
        {DRAWINGS[name]}
      </g>
    </svg>
  );
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 64) / 56} viewBox="0 0 56 64" aria-hidden="true" focusable="false">
      <path d="M28 61S6 39 6 24a22 22 0 0 1 44 0c0 15-22 37-22 37z" fill="#5B2EE5" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      <circle cx="28" cy="24" r="10" fill="#FFC93C" stroke={INK} strokeWidth={3.5} />
    </svg>
  );
}

import { describe, expect, it } from 'vitest';
import { distanceMeters, walkMinutes } from '../src/domain/geo';
import { formatDuration, formatHHMM, parseHHMM, toInputTime } from '../src/domain/time';

describe('geo', () => {
  it('measures a known distance within 2%', () => {
    // Piazza del Plebiscito -> Stazione Marittima, roughly 700 m
    const d = distanceMeters({ lat: 40.8359, lng: 14.2486 }, { lat: 40.8377, lng: 14.2562 });
    expect(d).toBeGreaterThan(600);
    expect(d).toBeLessThan(750);
  });
  it('is zero minutes for the same place and at least 1 otherwise', () => {
    const p = { lat: 40.8, lng: 14.2 };
    expect(walkMinutes(p, p)).toBe(0);
    expect(walkMinutes(p, { lat: 40.8001, lng: 14.2 })).toBe(1);
  });
});

describe('time', () => {
  it('parses and formats HH:MM', () => {
    expect(parseHHMM('15:30')).toBe(930);
    expect(parseHHMM('9:05')).toBe(545);
    expect(parseHHMM('24:00')).toBeNull();
    expect(parseHHMM('abc')).toBeNull();
    expect(formatHHMM(930)).toBe('15:30');
    expect(formatHHMM(1445)).toBe('0:05');
  });
  it('formats durations', () => {
    expect(formatDuration(45)).toBe('45 min');
    expect(formatDuration(120)).toBe('2 h');
    expect(formatDuration(350)).toBe('5 h 50 min');
    expect(formatDuration(-3)).toBe('0 min');
  });
});

describe('toInputTime', () => {
  it('pads hours for <input type="time">', () => {
    expect(toInputTime(9 * 60)).toBe('09:00');
    expect(toInputTime(14 * 60 + 50)).toBe('14:50');
  });
});

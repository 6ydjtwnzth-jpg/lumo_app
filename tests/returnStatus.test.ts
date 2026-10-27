import { describe, expect, it } from 'vitest';
import { returnStatus } from '../src/domain/returnStatus';

const base = { allAboardMin: 930, walkBackMin: 20, controlsMinutes: 15 };
// leave by = 930 - 15 - 20 - 10 = 885 (14:45)

describe('returnStatus', () => {
  it('is ok with plenty of time', () => {
    expect(returnStatus({ ...base, nowMin: 780 }).level).toBe('ok');
  });
  it('warns when the departure is close', () => {
    expect(returnStatus({ ...base, nowMin: 860 }).level).toBe('soon');
  });
  it('says go now at the departure time', () => {
    const s = returnStatus({ ...base, nowMin: 885 });
    expect(s.level).toBe('now');
    expect(s.leaveByMin).toBe(885);
  });
  it('flags a late return', () => {
    expect(returnStatus({ ...base, nowMin: 900 }).level).toBe('late');
  });
});

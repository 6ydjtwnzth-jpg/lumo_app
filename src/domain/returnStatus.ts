import type { Minutes } from './time';

export type ReturnLevel = 'ok' | 'soon' | 'now' | 'late';

export interface ReturnInput {
  nowMin: Minutes;
  allAboardMin: Minutes;
  walkBackMin: Minutes;
  controlsMinutes: Minutes;
  /** Cushion against delays on the way back. */
  bufferMinutes?: Minutes;
}

export interface ReturnStatus {
  level: ReturnLevel;
  minutesToAllAboard: Minutes;
  /** Latest time to start walking back. */
  leaveByMin: Minutes;
  /** Free minutes before the guest must start walking back. */
  freeMin: Minutes;
}

export function returnStatus(input: ReturnInput): ReturnStatus {
  const buffer = input.bufferMinutes ?? 10;
  const leaveByMin = input.allAboardMin - input.controlsMinutes - input.walkBackMin - buffer;
  const freeMin = leaveByMin - input.nowMin;
  const arrivesTooLate = input.nowMin + input.walkBackMin + input.controlsMinutes > input.allAboardMin;
  let level: ReturnLevel;
  if (arrivesTooLate) level = 'late';
  else if (freeMin <= 0) level = 'now';
  else if (freeMin <= 45) level = 'soon';
  else level = 'ok';
  return { level, minutesToAllAboard: input.allAboardMin - input.nowMin, leaveByMin, freeMin };
}

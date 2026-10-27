/** Times are minutes since midnight, local time of the port. */
export type Minutes = number;

export function parseHHMM(value: string): Minutes | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export function formatHHMM(total: Minutes): string {
  const t = ((Math.round(total) % 1440) + 1440) % 1440;
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
}

/** Zero-padded "HH:MM", the format required by <input type="time">. */
export function toInputTime(total: Minutes): string {
  return formatHHMM(total).padStart(5, '0');
}

export function formatDuration(total: Minutes): string {
  const t = Math.max(0, Math.round(total));
  const h = Math.floor(t / 60);
  const m = t % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function minutesOfDay(date: Date): Minutes {
  return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
}

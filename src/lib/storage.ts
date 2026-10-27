/** Tiny storage wrapper: never throws (private mode, blocked cookies, full quota). */
export interface KeyValueStore {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
}

const PREFIX = 'lumo:';

export const storage: KeyValueStore = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = globalThis.localStorage?.getItem(PREFIX + key);
      return raw == null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown): void {
    try {
      globalThis.localStorage?.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage unavailable: the app keeps working in memory */
    }
  },
};

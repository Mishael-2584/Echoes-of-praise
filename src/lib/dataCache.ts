const store = new Map<string, { at: number; data: unknown }>();
const TTL_MS = 90_000;

export function getCached<T>(key: string): T | null {
  const hit = store.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > TTL_MS) {
    store.delete(key);
    return null;
  }
  return hit.data as T;
}

export function setCached<T>(key: string, data: T) {
  store.set(key, { at: Date.now(), data });
}

export function clearDataCache(key?: string) {
  if (key) store.delete(key);
  else store.clear();
}

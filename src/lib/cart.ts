// Client-side cart storage. Persists only product ids so titles and prices
// always come from the database, and survives reloads, the inline login step,
// and email-verification round trips.

const STORAGE_KEY = 'bcc-cart';
const MAX_ITEMS = 20;
const EMPTY_IDS: string[] = [];

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function readIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_IDS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_IDS;
    return parsed
      .filter((value): value is string => typeof value === 'string' && value.length > 0)
      .slice(0, MAX_ITEMS);
  } catch {
    return EMPTY_IDS;
  }
}

export function subscribeCart(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

/** Stable snapshot for React; the parsed array is cached until it changes. */
export function getCartSnapshot(): string[] {
  if (cache === null) cache = readIds();
  return cache;
}

/** Server render has no storage, so hydration always starts from an empty cart. */
export function getServerCartSnapshot(): string[] {
  return EMPTY_IDS;
}

export function writeCart(ids: string[]): void {
  const next = ids.slice(0, MAX_ITEMS);
  const current = cache ?? readIds();
  // Bail out when nothing changed: notifying on an identical cart would
  // re-render subscribers for no reason (and can loop with effects that
  // clear an already-empty cart).
  if (current.length === next.length && current.every((id, index) => id === next[index])) {
    cache = current;
    return;
  }
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode): the cart lives only for this session.
  }
  for (const listener of listeners) listener();
}

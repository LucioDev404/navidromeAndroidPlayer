type CacheEntry<T> = {
  promise: Promise<T>;
  expiresAt: number;
};

const inflight = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 30_000;

export function dedupeRequest<T>(
  key: string,
  factory: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now();
  const existing = inflight.get(key) as CacheEntry<T> | undefined;

  if (existing && existing.expiresAt > now) {
    return existing.promise;
  }

  const promise = factory().finally(() => {
    const current = inflight.get(key);
    if (current?.promise === promise) {
      setTimeout(() => {
        const entry = inflight.get(key);
        if (entry?.promise === promise && entry.expiresAt <= Date.now()) {
          inflight.delete(key);
        }
      }, ttlMs);
    }
  });

  inflight.set(key, { promise, expiresAt: now + ttlMs });
  return promise;
}

export function clearRequestCache(prefix?: string): void {
  if (!prefix) {
    inflight.clear();
    return;
  }
  for (const key of inflight.keys()) {
    if (key.startsWith(prefix)) {
      inflight.delete(key);
    }
  }
}

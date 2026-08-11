const CACHE_TTL_MS = 15 * 60 * 1000;

const cache = new Map<string, { expiresAt: number; value: unknown }>();

export async function getCachedValue<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const cached = cache.get(key);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }

  if (cached) {
    cache.delete(key);
  }

  const value = await loader();
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });

  return value;
}

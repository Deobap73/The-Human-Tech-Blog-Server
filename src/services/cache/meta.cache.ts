// /src/services/cache/meta.cache.ts
'use strict';

type Entry<T> = { value: T; exp: number };

export class MetaCache<T = unknown> {
  private store = new Map<string, Entry<T>>();

  constructor(private defaultTtlMs = 60 * 60 * 1000) {} // 1h default

  get(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.exp) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    const exp = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { value, exp });
  }

  del(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// A singleton cache instance for meta
export const metaCache = new MetaCache<unknown>();

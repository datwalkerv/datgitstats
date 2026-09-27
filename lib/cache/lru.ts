/** Minimal LRU keyed by string. Entries keep their value after expiry so callers can serve stale data. */
export class LRU<V> {
  private map = new Map<string, { value: V; expires: number }>();
  constructor(private readonly max: number) {}

  get(key: string): { value: V; fresh: boolean } | undefined {
    const hit = this.map.get(key);
    if (!hit) return undefined;
    this.map.delete(key);
    this.map.set(key, hit);
    return { value: hit.value, fresh: hit.expires > Date.now() };
  }

  set(key: string, value: V, ttlSeconds: number) {
    this.map.delete(key);
    this.map.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
    while (this.map.size > this.max) this.map.delete(this.map.keys().next().value!);
  }

  delete(key: string) {
    this.map.delete(key);
  }
}

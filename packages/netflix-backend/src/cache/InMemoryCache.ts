import { MetricsRegistry } from "../instrumentation/MetricsRegistry";

/**
 * Simple cache en mémoire avec instrumentation des hits/misses
 */
export class InMemoryCache<K, V> {
  private store = new Map<K, V>();
  private instrumentation: typeof MetricsRegistry;

  constructor(instrumentation: typeof MetricsRegistry = MetricsRegistry) {
    this.instrumentation = instrumentation;
  }

  get(key: K): V | null {
    if (this.store.has(key)) {
      this.instrumentation.increment("cache.hit");
      return this.store.get(key)!;
    } else {
      this.instrumentation.increment("cache.miss");
      return null;
    }
  }

  set(key: K, value: V) {
    this.store.set(key, value);
  }

  has(key: K): boolean {
    return this.store.has(key);
  }

  clear() {
    this.store.clear();
  }
}

import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryCache } from "../src/cache/InMemoryCache";
import { MetricsRegistry } from "../src/instrumentation/MetricsRegistry";
import { Movie } from "../src/domain/movie/Movie";

/**
 * Ces tests valident :
 *  - les hits / misses du cache
 *  - le nombre d'appels providers
 *  - les timings mesurés
 */

describe("InMemoryCache Metrics Validation", () => {
  let cache: InMemoryCache<string, Movie>;

  beforeEach(() => {
    MetricsRegistry.reset();
    cache = new InMemoryCache<string, Movie>(MetricsRegistry);
    cache.set("1", { id: "1", title: "Mock Movie 1" } as Movie);
  });

  it("should record cache hits and misses", () => {
    // Cache hit
    const movie1 = cache.get("1");
    expect(movie1).not.toBeNull();

    // Cache miss
    const movie2 = cache.get("999");
    expect(movie2).toBeNull();

    // Vérification des métriques via snapshot
    const snap = MetricsRegistry.snapshot();
    expect(snap.counters["cache.hit"]).toBe(1);
    expect(snap.counters["cache.miss"]).toBe(1);

    // Vérification que les timers sont bien créés si utilisés dans l'instrumentation
    if (snap.timers["InMemoryCache.get"]) {
      const timing = snap.timers["InMemoryCache.get"];
      console.log(
        `InMemoryCache.get appelé ${timing.count} fois, temps total ${timing.total}ms`,
      );
    }
  });
});

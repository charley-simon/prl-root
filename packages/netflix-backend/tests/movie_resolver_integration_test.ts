import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryMovieRepository } from "../src/infrastructure/repositories/InMemoryMovieRepository";
import { MetricsRegistry } from "../src/instrumentation/MetricsRegistry";
import { MovieResolver } from "../src/application/services/MovieResolver";
import { MockMovieProvider } from "../src/application/ports/MovieProvider";

describe("MovieResolver Integration with Metrics", () => {
  let repo: InMemoryMovieRepository;
  let provider: MockMovieProvider;
  let resolver: MovieResolver;

  beforeEach(() => {
    MetricsRegistry.reset();
    repo = new InMemoryMovieRepository();
    provider = new MockMovieProvider();
    resolver = new MovieResolver({
      repo,
      providers: [provider],
      instrumentation: MetricsRegistry,
    });
  });

  it("should retrieve movie and record metrics", async () => {
    // 1️⃣ Premier appel → cache miss, provider utilisé
    const movie1 = await resolver.getById("1");
    expect(movie1).not.toBeNull();

    let snap = MetricsRegistry.snapshot();
    expect(snap.counters["cache.miss"]).toBe(1);
    expect(snap.counters["cache.hit"] ?? 0).toBe(0);
    expect(snap.timers["MovieResolver.getById"].count).toBe(1);

    // 2️⃣ Deuxième appel → cache hit
    const movie2 = await resolver.getById("1");
    expect(movie2).toBe(movie1);

    snap = MetricsRegistry.snapshot();
    expect(snap.counters["cache.hit"]).toBe(1);
    expect(snap.counters["cache.miss"]).toBe(1);
    expect(snap.timers["MovieResolver.getById"].count).toBe(2);
  });

  it("should throw error if movie not found in any provider", async () => {
    await expect(resolver.getById("999")).rejects.toThrow(
      "Movie with id 999 not found in any provider",
    );

    const snap = MetricsRegistry.snapshot();
    expect(snap.counters["cache.miss"]).toBe(1);
    expect(snap.counters["cache.hit"] ?? 0).toBe(0);
  });
});

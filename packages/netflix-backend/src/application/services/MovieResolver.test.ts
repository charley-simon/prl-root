import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryMovieRepository } from "../../infrastructure/repositories/InMemoryMovieRepository";
import { MetricsRegistry } from "../../instrumentation/MetricsRegistry";
import { MovieResolver } from "./MovieResolver";
import { MockMovieProvider } from "../ports/MovieProvider";
import { Movie } from "../../domain/movie/Movie";

describe("MovieResolver", () => {
  let repo: InMemoryMovieRepository;
  let provider: MockMovieProvider;
  let resolver: MovieResolver;

  beforeEach(() => {
    MetricsRegistry.reset();
    repo = new InMemoryMovieRepository();
    provider = new MockMovieProvider({
      "1": { id: "1", title: "Movie One" } as Movie,
      "2": { id: "2", title: "Movie Two" } as Movie,
    });
    resolver = new MovieResolver({
      repo,
      providers: [provider],
      instrumentation: MetricsRegistry,
    });
  });

  it("should retrieve a movie from provider and cache it", async () => {
    const movie = await resolver.getById("1");
    expect(movie).not.toBeNull();
    expect(movie.id).toBe("1");

    const snap = MetricsRegistry.snapshot();
    expect(snap.timers["MovieResolver.getById"].count).toBe(1);
  });

  it("should throw error if movie not found in any provider", async () => {
    await expect(resolver.getById("999")).rejects.toThrow(
      "Movie with id 999 not found in any provider",
    );

    const snap = MetricsRegistry.snapshot();
    expect(snap.timers["MovieResolver.getById"].count).toBe(1);
  });

  it("should retrieve multiple movies independently", async () => {
    const movie1 = await resolver.getById("1");
    const movie2 = await resolver.getById("2");
    expect(movie1.id).toBe("1");
    expect(movie2.id).toBe("2");

    const snap = MetricsRegistry.snapshot();
    expect(snap.timers["MovieResolver.getById"].count).toBe(2);
  });
});

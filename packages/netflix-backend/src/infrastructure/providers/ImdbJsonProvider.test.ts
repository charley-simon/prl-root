import { describe, it, expect, beforeEach } from "vitest";
import { ImdbJsonProvider } from "./ImdbJsonProvider";
import { MetricsRegistry } from "../../instrumentation/MetricsRegistry";
import { Movie } from "../../domain/movie/Movie";

describe("ImdbJsonProvider", () => {
  let provider: ImdbJsonProvider;

  beforeEach(() => {
    MetricsRegistry.reset();
    provider = new ImdbJsonProvider({
      mockData: {
        "1": { id: "1", title: "Movie One" } as Movie,
        "2": { id: "2", title: "Movie Two" } as Movie,
      },
    });
  });

  it("should return a movie by id", async () => {
    const movie = await provider.fetchById("1");
    expect(movie).not.toBeNull();
    expect(movie.id).toBe("1");

    const snap = MetricsRegistry.snapshot();
    expect(snap.timers["ImdbJsonProvider.fetchById"].count).toBe(1);
  });

  it("should throw an error if movie does not exist", async () => {
    await expect(provider.fetchById("999")).rejects.toThrow(
      /Movie with id 999/,
    );

    const snap = MetricsRegistry.snapshot();
    expect(snap.timers["ImdbJsonProvider.fetchById"].count).toBe(1);
  });

  it("should return multiple movies independently", async () => {
    const movie1 = await provider.fetchById("1");
    const movie2 = await provider.fetchById("2");
    expect(movie1.id).toBe("1");
    expect(movie2.id).toBe("2");

    const snap = MetricsRegistry.snapshot();
    expect(snap.timers["ImdbJsonProvider.fetchById"].count).toBe(2);
  });
});

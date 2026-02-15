import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryMovieRepository } from "./InMemoryMovieRepository";
import { MetricsRegistry } from "../../instrumentation/MetricsRegistry";

const movie = { id: "1", title: "Test Movie" } as any;

describe("InMemoryMovieRepository", () => {
  let repo: InMemoryMovieRepository;

  beforeEach(() => {
    repo = new InMemoryMovieRepository();
    MetricsRegistry.reset();
  });

  it("records cache miss then hit", async () => {
    const m1 = await repo.findById("1");
    expect(m1).toBeNull();

    await repo.save(movie);
    const m2 = await repo.findById("1");
    expect(m2).toBe(movie);

    const snap = MetricsRegistry.snapshot();
    expect(snap.counters["cache.miss"]).toBe(1);
    expect(snap.counters["cache.hit"]).toBe(1);
  });
});

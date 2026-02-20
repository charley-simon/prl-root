"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const InMemoryMovieRepository_1 = require("./InMemoryMovieRepository");
const MetricsRegistry_1 = require("../../instrumentation/MetricsRegistry");
const movie = { id: "1", title: "Test Movie" };
(0, vitest_1.describe)("InMemoryMovieRepository", () => {
    let repo;
    (0, vitest_1.beforeEach)(() => {
        repo = new InMemoryMovieRepository_1.InMemoryMovieRepository();
        MetricsRegistry_1.MetricsRegistry.reset();
    });
    (0, vitest_1.it)("records cache miss then hit", async () => {
        const m1 = await repo.findById("1");
        (0, vitest_1.expect)(m1).toBeNull();
        await repo.save(movie);
        const m2 = await repo.findById("1");
        (0, vitest_1.expect)(m2).toBe(movie);
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.counters["cache.miss"]).toBe(1);
        (0, vitest_1.expect)(snap.counters["cache.hit"]).toBe(1);
    });
});

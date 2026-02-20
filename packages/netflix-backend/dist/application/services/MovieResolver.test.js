"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const InMemoryMovieRepository_1 = require("../../infrastructure/repositories/InMemoryMovieRepository");
const MetricsRegistry_1 = require("../../instrumentation/MetricsRegistry");
const MovieResolver_1 = require("./MovieResolver");
const MovieProvider_1 = require("../ports/MovieProvider");
(0, vitest_1.describe)("MovieResolver", () => {
    let repo;
    let provider;
    let resolver;
    (0, vitest_1.beforeEach)(() => {
        MetricsRegistry_1.MetricsRegistry.reset();
        repo = new InMemoryMovieRepository_1.InMemoryMovieRepository();
        provider = new MovieProvider_1.MockMovieProvider({
            "1": { id: "1", title: "Movie One" },
            "2": { id: "2", title: "Movie Two" },
        });
        resolver = new MovieResolver_1.MovieResolver({
            repo,
            providers: [provider],
            instrumentation: MetricsRegistry_1.MetricsRegistry,
        });
    });
    (0, vitest_1.it)("should retrieve a movie from provider and cache it", async () => {
        const movie = await resolver.getById("1");
        (0, vitest_1.expect)(movie).not.toBeNull();
        (0, vitest_1.expect)(movie.id).toBe("1");
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.timers["MovieResolver.getById"].count).toBe(1);
    });
    (0, vitest_1.it)("should throw error if movie not found in any provider", async () => {
        await (0, vitest_1.expect)(resolver.getById("999")).rejects.toThrow("Movie with id 999 not found in any provider");
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.timers["MovieResolver.getById"].count).toBe(1);
    });
    (0, vitest_1.it)("should retrieve multiple movies independently", async () => {
        const movie1 = await resolver.getById("1");
        const movie2 = await resolver.getById("2");
        (0, vitest_1.expect)(movie1.id).toBe("1");
        (0, vitest_1.expect)(movie2.id).toBe("2");
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.timers["MovieResolver.getById"].count).toBe(2);
    });
});

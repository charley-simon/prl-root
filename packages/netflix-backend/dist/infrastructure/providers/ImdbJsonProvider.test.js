"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const ImdbJsonProvider_1 = require("./ImdbJsonProvider");
const MetricsRegistry_1 = require("../../instrumentation/MetricsRegistry");
(0, vitest_1.describe)("ImdbJsonProvider", () => {
    let provider;
    (0, vitest_1.beforeEach)(() => {
        MetricsRegistry_1.MetricsRegistry.reset();
        provider = new ImdbJsonProvider_1.ImdbJsonProvider({
            mockData: {
                "1": { id: "1", title: "Movie One" },
                "2": { id: "2", title: "Movie Two" },
            },
        });
    });
    (0, vitest_1.it)("should return a movie by id", async () => {
        const movie = await provider.fetchById("1");
        (0, vitest_1.expect)(movie).not.toBeNull();
        (0, vitest_1.expect)(movie.id).toBe("1");
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.timers["ImdbJsonProvider.fetchById"].count).toBe(1);
    });
    (0, vitest_1.it)("should throw an error if movie does not exist", async () => {
        await (0, vitest_1.expect)(provider.fetchById("999")).rejects.toThrow(/Movie with id 999/);
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.timers["ImdbJsonProvider.fetchById"].count).toBe(1);
    });
    (0, vitest_1.it)("should return multiple movies independently", async () => {
        const movie1 = await provider.fetchById("1");
        const movie2 = await provider.fetchById("2");
        (0, vitest_1.expect)(movie1.id).toBe("1");
        (0, vitest_1.expect)(movie2.id).toBe("2");
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.timers["ImdbJsonProvider.fetchById"].count).toBe(2);
    });
});

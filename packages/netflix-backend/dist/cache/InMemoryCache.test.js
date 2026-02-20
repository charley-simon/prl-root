"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const InMemoryCache_1 = require("./InMemoryCache");
const MetricsRegistry_1 = require("../instrumentation/MetricsRegistry");
(0, vitest_1.describe)("InMemoryCache", () => {
    let cache;
    (0, vitest_1.beforeEach)(() => {
        MetricsRegistry_1.MetricsRegistry.reset();
        cache = new InMemoryCache_1.InMemoryCache(MetricsRegistry_1.MetricsRegistry);
    });
    (0, vitest_1.it)("should set and get values correctly", () => {
        cache.set("key1", "value1");
        (0, vitest_1.expect)(cache.get("key1")).toBe("value1");
        (0, vitest_1.expect)(cache.get("nonexistent")).toBeNull();
    });
    (0, vitest_1.it)("should record cache hits and misses", () => {
        cache.set("key1", "value1");
        // Hit
        cache.get("key1");
        // Miss
        cache.get("key2");
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.counters["cache.hit"]).toBe(1);
        (0, vitest_1.expect)(snap.counters["cache.miss"]).toBe(1);
    });
    (0, vitest_1.it)("should clear the cache", () => {
        cache.set("key1", "value1");
        cache.clear();
        (0, vitest_1.expect)(cache.get("key1")).toBeNull();
    });
});

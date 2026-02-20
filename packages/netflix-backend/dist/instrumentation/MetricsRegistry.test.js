"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const MetricsRegistry_1 = require("./MetricsRegistry");
(0, vitest_1.describe)("MetricsRegistry", () => {
    (0, vitest_1.beforeEach)(() => {
        MetricsRegistry_1.MetricsRegistry.reset();
    });
    (0, vitest_1.it)("should increment counters correctly", () => {
        MetricsRegistry_1.MetricsRegistry.increment("test.counter");
        MetricsRegistry_1.MetricsRegistry.increment("test.counter");
        MetricsRegistry_1.MetricsRegistry.increment("another.counter", 3);
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.counters["test.counter"]).toBe(2);
        (0, vitest_1.expect)(snap.counters["another.counter"]).toBe(3);
    });
    (0, vitest_1.it)("should increment timers correctly", () => {
        MetricsRegistry_1.MetricsRegistry.incrementTimer("timer.metric", 10);
        MetricsRegistry_1.MetricsRegistry.incrementTimer("timer.metric", 20);
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(snap.timers["timer.metric"].count).toBe(2);
        (0, vitest_1.expect)(snap.timers["timer.metric"].total).toBe(30);
    });
    (0, vitest_1.it)("should reset metrics correctly", () => {
        MetricsRegistry_1.MetricsRegistry.increment("a");
        MetricsRegistry_1.MetricsRegistry.incrementTimer("b", 5);
        MetricsRegistry_1.MetricsRegistry.reset();
        const snap = MetricsRegistry_1.MetricsRegistry.snapshot();
        (0, vitest_1.expect)(Object.keys(snap.counters)).toHaveLength(0);
        (0, vitest_1.expect)(Object.keys(snap.timers));
    });
});

import { describe, it, expect, beforeEach } from "vitest";
import { MetricsRegistry } from "./MetricsRegistry";

describe("MetricsRegistry", () => {
  beforeEach(() => {
    MetricsRegistry.reset();
  });

  it("should increment counters correctly", () => {
    MetricsRegistry.increment("test.counter");
    MetricsRegistry.increment("test.counter");
    MetricsRegistry.increment("another.counter", 3);

    const snap = MetricsRegistry.snapshot();
    expect(snap.counters["test.counter"]).toBe(2);
    expect(snap.counters["another.counter"]).toBe(3);
  });

  it("should increment timers correctly", () => {
    MetricsRegistry.incrementTimer("timer.metric", 10);
    MetricsRegistry.incrementTimer("timer.metric", 20);

    const snap = MetricsRegistry.snapshot();
    expect(snap.timers["timer.metric"].count).toBe(2);
    expect(snap.timers["timer.metric"].total).toBe(30);
  });

  it("should reset metrics correctly", () => {
    MetricsRegistry.increment("a");
    MetricsRegistry.incrementTimer("b", 5);

    MetricsRegistry.reset();
    const snap = MetricsRegistry.snapshot();
    expect(Object.keys(snap.counters)).toHaveLength(0);
    expect(Object.keys(snap.timers));
  });
});

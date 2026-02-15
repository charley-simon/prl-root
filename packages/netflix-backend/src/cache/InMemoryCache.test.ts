import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryCache } from "./InMemoryCache";
import { MetricsRegistry } from "../instrumentation/MetricsRegistry";

describe("InMemoryCache", () => {
  let cache: InMemoryCache<string, string>;

  beforeEach(() => {
    MetricsRegistry.reset();
    cache = new InMemoryCache<string, string>(MetricsRegistry);
  });

  it("should set and get values correctly", () => {
    cache.set("key1", "value1");
    expect(cache.get("key1")).toBe("value1");
    expect(cache.get("nonexistent")).toBeNull();
  });

  it("should record cache hits and misses", () => {
    cache.set("key1", "value1");

    // Hit
    cache.get("key1");
    // Miss
    cache.get("key2");

    const snap = MetricsRegistry.snapshot();
    expect(snap.counters["cache.hit"]).toBe(1);
    expect(snap.counters["cache.miss"]).toBe(1);
  });

  it("should clear the cache", () => {
    cache.set("key1", "value1");
    cache.clear();
    expect(cache.get("key1")).toBeNull();
  });
});

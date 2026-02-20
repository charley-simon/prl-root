"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = void 0;
const MetricsRegistry_1 = require("../instrumentation/MetricsRegistry");
/**
 * Simple cache en mémoire avec instrumentation des hits/misses
 */
class InMemoryCache {
    constructor(instrumentation = MetricsRegistry_1.MetricsRegistry) {
        this.store = new Map();
        this.instrumentation = instrumentation;
    }
    get(key) {
        if (this.store.has(key)) {
            this.instrumentation.increment("cache.hit");
            return this.store.get(key);
        }
        else {
            this.instrumentation.increment("cache.miss");
            return null;
        }
    }
    set(key, value) {
        this.store.set(key, value);
    }
    has(key) {
        return this.store.has(key);
    }
    clear() {
        this.store.clear();
    }
}
exports.InMemoryCache = InMemoryCache;

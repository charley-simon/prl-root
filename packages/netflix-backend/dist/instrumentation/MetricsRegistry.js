"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsRegistry = void 0;
class MetricsRegistry {
    static reset() {
        this.counters = {};
        this.timers = {};
    }
    static increment(name, value = 1) {
        this.counters[name] = (this.counters[name] ?? 0) + value;
    }
    /**
     * Enregistre la durée d'une opération
     * @param name clé de la métrique
     * @param duration en millisecondes
     */
    static incrementTimer(name, duration) {
        if (!this.timers[name])
            this.timers[name] = { count: 0, total: 0 };
        this.timers[name].count += 1;
        this.timers[name].total += duration;
    }
    static snapshot() {
        return {
            counters: { ...this.counters },
            timers: { ...this.timers },
        };
    }
}
exports.MetricsRegistry = MetricsRegistry;
MetricsRegistry.counters = {};
MetricsRegistry.timers = {};

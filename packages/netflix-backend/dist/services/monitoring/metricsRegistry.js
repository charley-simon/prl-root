"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsRegistry = exports.MetricsRegistry = void 0;
class MetricsRegistry {
    constructor() {
        this.counters = {};
        this.timers = {};
        this.histograms = {};
    }
    // -------- Counters --------
    counter(name) {
        return {
            inc: (value = 1) => {
                this.counters[name] = (this.counters[name] ?? 0) + value;
            }
        };
    }
    getCounter(name) {
        return this.counters[name] ?? 0;
    }
    // -------- Timers --------
    timer(name) {
        return {
            record: (durationMs) => {
                if (!this.timers[name])
                    this.timers[name] = [];
                this.timers[name].push(durationMs);
            }
        };
    }
    getTimer(name) {
        return this.timers[name] ?? [];
    }
    // -------- Histograms --------
    histogram(name) {
        return {
            record: (value) => {
                if (!this.histograms[name])
                    this.histograms[name] = [];
                this.histograms[name].push(value);
            }
        };
    }
    getHistogram(name) {
        return this.histograms[name] ?? [];
    }
    // -------- Reset (tests) --------
    reset() {
        this.counters = {};
        this.timers = {};
        this.histograms = {};
    }
}
exports.MetricsRegistry = MetricsRegistry;
// singleton global
exports.metricsRegistry = new MetricsRegistry();

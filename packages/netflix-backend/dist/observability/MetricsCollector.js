"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsCollector = void 0;
class MetricsCollector {
    constructor() {
        this.metrics = {};
    }
    startSpan(name) {
        const start = Date.now();
        if (!this.metrics[name]) {
            this.metrics[name] = {
                count: 0,
                totalTime: 0,
                minTime: Infinity,
                maxTime: 0,
            };
        }
        return {
            end: (duration) => {
                const elapsed = duration ?? Date.now() - start;
                const metric = this.metrics[name];
                metric.count += 1;
                metric.totalTime += elapsed;
                metric.minTime = Math.min(metric.minTime, elapsed);
                metric.maxTime = Math.max(metric.maxTime, elapsed);
            },
        };
    }
    getMetrics() {
        const result = {};
        for (const key in this.metrics) {
            const m = this.metrics[key];
            result[key] = {
                count: m.count,
                totalTime: m.totalTime,
                avgTime: m.count > 0 ? m.totalTime / m.count : 0,
                minTime: m.minTime === Infinity ? 0 : m.minTime,
                maxTime: m.maxTime,
            };
        }
        return result;
    }
}
exports.MetricsCollector = MetricsCollector;

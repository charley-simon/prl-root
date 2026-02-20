"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsInstrumentation = void 0;
class MetricsInstrumentation {
    constructor(collector) {
        this.collector = collector;
    }
    startSpan(name) {
        const span = this.collector.startSpan(name);
        return {
            end: (result) => {
                span.end();
            },
            error: (err) => {
                span.end();
            },
        };
    }
}
exports.MetricsInstrumentation = MetricsInstrumentation;

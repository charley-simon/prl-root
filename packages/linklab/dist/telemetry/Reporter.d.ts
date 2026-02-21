import { Tracer } from '../telemetry/Tracer';
import { MetricsCollector } from '../telemetry/Metrics';
export declare class Reporter {
    private tracer;
    private metrics;
    constructor(tracer: Tracer, metrics: MetricsCollector);
    generateReport(): string;
    exportJSON(filepath: string): void;
    exportTimeline(filepath: string): void;
}
//# sourceMappingURL=Reporter.d.ts.map
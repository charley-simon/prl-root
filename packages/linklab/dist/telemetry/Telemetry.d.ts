import type { TraceEvent } from './types';
export declare class Telemetry {
    private tracer;
    constructor();
    trace(event: TraceEvent): void;
    getTraces(): TraceEvent[];
    clear(): void;
}
//# sourceMappingURL=Telemetry.d.ts.map
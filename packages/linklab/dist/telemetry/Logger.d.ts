import type { TraceEvent } from './types';
export declare class Logger {
    private depth;
    log(event: TraceEvent): void;
    group(title: string, fn: () => void): void;
    table(data: Record<string, any>[]): void;
    reset(): void;
}
//# sourceMappingURL=Logger.d.ts.map
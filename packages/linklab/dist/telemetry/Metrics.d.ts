import { Tracer } from '../telemetry/Tracer';
export interface EngineMetrics {
    totalResolutions: number;
    successfulResolutions: number;
    failedResolutions: number;
    avgResolutionTime: number;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: number;
    actionsExecuted: number;
    actionsDeferred: number;
    actionsByType: Record<string, number>;
    pathsFound: number;
    pathsNotFound: number;
    avgPathWeight: number;
    avgPathHops: number;
    relationUsage: Record<string, number>;
    mostUsedRelation: string;
    totalSteps: number;
    totalDuration: number;
    avgStepDuration: number;
}
export declare class MetricsCollector {
    private tracer;
    private metrics;
    private resolutionTimes;
    private pathWeights;
    private pathHops;
    private stepDurations;
    constructor(tracer: Tracer);
    private handleEvent;
    getMetrics(): EngineMetrics;
    private calculateRelationUsage;
    private findMostUsedRelation;
}
//# sourceMappingURL=Metrics.d.ts.map
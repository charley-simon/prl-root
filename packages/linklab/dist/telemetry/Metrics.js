export class MetricsCollector {
    constructor(tracer) {
        this.tracer = tracer;
        this.metrics = {};
        this.resolutionTimes = [];
        this.pathWeights = [];
        this.pathHops = [];
        this.stepDurations = [];
        tracer.on(event => this.handleEvent(event));
    }
    handleEvent(event) {
        switch (event.type) {
            case 'RESOLVE_SUCCESS':
                this.metrics.totalResolutions = (this.metrics.totalResolutions || 0) + 1;
                this.metrics.successfulResolutions = (this.metrics.successfulResolutions || 0) + 1;
                break;
            case 'RESOLVE_FAIL':
                this.metrics.totalResolutions = (this.metrics.totalResolutions || 0) + 1;
                this.metrics.failedResolutions = (this.metrics.failedResolutions || 0) + 1;
                break;
            case 'CACHE_HIT':
                this.metrics.cacheHits = (this.metrics.cacheHits || 0) + 1;
                break;
            case 'CACHE_MISS':
                this.metrics.cacheMisses = (this.metrics.cacheMisses || 0) + 1;
                break;
            case 'ACTION_EXECUTE':
                this.metrics.actionsExecuted = (this.metrics.actionsExecuted || 0) + 1;
                if (!this.metrics.actionsByType)
                    this.metrics.actionsByType = {};
                this.metrics.actionsByType[event.name] = (this.metrics.actionsByType[event.name] || 0) + 1;
                break;
            case 'ACTION_DEFER':
                this.metrics.actionsDeferred = (this.metrics.actionsDeferred || 0) + 1;
                break;
            case 'PATH_FOUND':
                this.metrics.pathsFound = (this.metrics.pathsFound || 0) + 1;
                this.pathWeights.push(event.weight);
                this.pathHops.push(event.hops);
                break;
            case 'PATH_NOT_FOUND':
                this.metrics.pathsNotFound = (this.metrics.pathsNotFound || 0) + 1;
                break;
            case 'STEP_END':
                this.metrics.totalSteps = (this.metrics.totalSteps || 0) + 1;
                this.stepDurations.push(event.duration);
                break;
        }
    }
    getMetrics() {
        const totalHits = this.metrics.cacheHits || 0;
        const totalMisses = this.metrics.cacheMisses || 0;
        const totalCache = totalHits + totalMisses;
        return {
            totalResolutions: this.metrics.totalResolutions || 0,
            successfulResolutions: this.metrics.successfulResolutions || 0,
            failedResolutions: this.metrics.failedResolutions || 0,
            avgResolutionTime: avg(this.resolutionTimes),
            cacheHits: totalHits,
            cacheMisses: totalMisses,
            cacheHitRate: totalCache > 0 ? totalHits / totalCache : 0,
            actionsExecuted: this.metrics.actionsExecuted || 0,
            actionsDeferred: this.metrics.actionsDeferred || 0,
            actionsByType: this.metrics.actionsByType || {},
            pathsFound: this.metrics.pathsFound || 0,
            pathsNotFound: this.metrics.pathsNotFound || 0,
            avgPathWeight: avg(this.pathWeights),
            avgPathHops: avg(this.pathHops),
            relationUsage: this.calculateRelationUsage(),
            mostUsedRelation: this.findMostUsedRelation(),
            totalSteps: this.metrics.totalSteps || 0,
            totalDuration: sum(this.stepDurations),
            avgStepDuration: avg(this.stepDurations)
        };
    }
    calculateRelationUsage() {
        const usage = {};
        const resolveEvents = this.tracer.getEventsByType('RESOLVE_SUCCESS');
        resolveEvents.forEach(e => {
            usage[e.via] = (usage[e.via] || 0) + 1;
        });
        return usage;
    }
    findMostUsedRelation() {
        const usage = this.calculateRelationUsage();
        const entries = Object.entries(usage);
        if (entries.length === 0)
            return 'none';
        return entries.reduce((max, [name, count]) => (count > (usage[max] || 0) ? name : max), entries[0][0]);
    }
}
function avg(arr) {
    return arr.length > 0 ? sum(arr) / arr.length : 0;
}
function sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
}
//# sourceMappingURL=Metrics.js.map
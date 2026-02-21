export type TraceEvent = {
    type: 'RESOLVE_START';
    entity: string;
    id?: number;
} | {
    type: 'RESOLVE_SUCCESS';
    entity: string;
    id: number;
    via: string;
    from: string;
} | {
    type: 'RESOLVE_FAIL';
    entity: string;
    reason: string;
} | {
    type: 'CACHE_HIT';
    from: string;
    to: string;
    path: string[];
} | {
    type: 'CACHE_MISS';
    from: string;
    to: string;
} | {
    type: 'ACTION_SELECTED';
    name: string;
    weight: number;
} | {
    type: 'ACTION_EXECUTE';
    name: string;
    result: string;
} | {
    type: 'ACTION_DEFER';
    name: string;
    cooldown: number;
} | {
    type: 'PATH_FOUND';
    from: string;
    to: string;
    hops: number;
    weight: number;
} | {
    type: 'PATH_NOT_FOUND';
    from: string;
    to: string;
} | {
    type: 'STEP_START';
    time: number;
} | {
    type: 'STEP_END';
    time: number;
    duration: number;
};
export declare class Tracer {
    private events;
    private listeners;
    trace(event: TraceEvent): void;
    on(listener: (event: TraceEvent) => void): void;
    getEvents(): TraceEvent[];
    getEventsByType<T extends TraceEvent['type']>(type: T): Extract<TraceEvent, {
        type: T;
    }>[];
}
//# sourceMappingURL=Tracer.d.ts.map
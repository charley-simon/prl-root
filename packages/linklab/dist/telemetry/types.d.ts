import type { Path } from '..';
export type TraceEventType = 'RESOLVE_START' | 'RESOLVE_SUCCESS' | 'RESOLVE_FAIL' | 'ACTION_SELECT' | 'ACTION_EXECUTE' | 'STEP_START' | 'STEP_END' | 'PATH_FOUND' | 'PATH_NOT_FOUND' | 'GRAPH_TRAIN' | 'GRAPH_ADAPT';
export type TraceEvent = {
    type: TraceEventType;
    time?: number;
    entity?: string;
    id?: number;
    relation?: string;
    action?: string;
    result?: 'SUCCESS' | 'FAIL' | 'DEFER';
    reason?: string;
    resolvedCount?: number;
    unresolvedCount?: number;
    deferredCount?: number;
    path?: Path;
    from?: string;
    to?: string;
    queryCount?: number;
    oldWeight?: number;
    newWeight?: number;
};
//# sourceMappingURL=types.d.ts.map
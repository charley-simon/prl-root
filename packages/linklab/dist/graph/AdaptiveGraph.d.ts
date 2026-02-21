import type { Graph, PathQuery } from '../types';
export declare class AdaptiveGraph {
    private mutableGraph;
    constructor(graph: Graph);
    getGraph(): Graph;
    train(queries: PathQuery[]): void;
    private simplify;
    adapt(relationName: string, blocked: boolean): void;
    export(): Graph;
}
//# sourceMappingURL=AdaptiveGraph.d.ts.map
import type { Frame, Graph } from '../types';
export declare class Resolver {
    private graph;
    private logger;
    constructor(graph: Graph);
    resolve(stack: Frame[]): Promise<Frame[]>;
}
//# sourceMappingURL=Resolver.d.ts.map
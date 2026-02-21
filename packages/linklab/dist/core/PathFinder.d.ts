import type { Graph, Path } from '../types';
export declare class PathFinder {
    private graph;
    constructor(graph: Graph);
    findBest(from: string, to: string): Path | null;
    findAll(from: string, to: string, maxPaths?: number): Path[];
    private buildPath;
}
//# sourceMappingURL=PathFinder.d.ts.map
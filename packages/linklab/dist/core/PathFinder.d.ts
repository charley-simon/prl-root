import type { Graph, Path } from '../types';
export declare class PathFinder {
    private graph;
    constructor(graph: Graph);
    find(from: string, to: string): Path | null;
    findAll(from: string, to: string, maxPaths?: number): Path[];
    private getNeighbors;
    hasPath(from: string, to: string): boolean;
    getReachableNodes(from: string, maxDistance?: number): string[];
}
//# sourceMappingURL=PathFinder.d.ts.map
import { findPath } from '../algorithms/findPath';
import { findAllPaths } from '../algorithms/findAllPaths';
export class PathFinder {
    constructor(graph) {
        this.graph = graph;
    }
    findBest(from, to) {
        const relations = findPath(this.graph, from, to);
        if (!relations)
            return null;
        return this.buildPath(relations, from, to);
    }
    findAll(from, to, maxPaths = 5) {
        const allRelations = findAllPaths(this.graph, from, to, maxPaths);
        return allRelations
            .map(rels => this.buildPath(rels, from, to))
            .sort((a, b) => a.totalWeight - b.totalWeight);
    }
    buildPath(relations, from, to) {
        const nodes = [from];
        for (const rel of relations) {
            nodes.push(rel.toEntity);
        }
        const totalWeight = relations.reduce((sum, r) => sum + r.weight, 0);
        return { nodes, relations, totalWeight };
    }
}
//# sourceMappingURL=PathFinder.js.map
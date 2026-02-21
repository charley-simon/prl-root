export class PathFinder {
    constructor(graph) {
        this.graph = graph;
    }
    find(from, to) {
        const paths = this.findAll(from, to, 1);
        return paths.length > 0 ? paths[0] : null;
    }
    findAll(from, to, maxPaths = 5) {
        const paths = [];
        const queue = [{ path: [from], relations: [], weight: 0 }];
        const visited = new Set();
        while (queue.length > 0 && paths.length < maxPaths) {
            const current = queue.shift();
            const lastNode = current.path[current.path.length - 1];
            if (lastNode === to) {
                paths.push({
                    nodes: current.path,
                    relations: current.relations,
                    totalWeight: current.weight
                });
                continue;
            }
            const pathKey = current.path.join('→');
            if (visited.has(pathKey + lastNode))
                continue;
            visited.add(pathKey + lastNode);
            const neighbors = this.getNeighbors(lastNode);
            neighbors.forEach(({ node, relation }) => {
                if (!current.path.includes(node)) {
                    queue.push({
                        path: [...current.path, node],
                        relations: [...current.relations, relation],
                        weight: current.weight + relation.weight
                    });
                }
            });
        }
        return paths.sort((a, b) => a.totalWeight - b.totalWeight);
    }
    getNeighbors(node) {
        const neighbors = [];
        this.graph.relations.forEach(rel => {
            if (rel.fromEntity === node) {
                neighbors.push({
                    node: rel.toEntity,
                    relation: rel
                });
            }
            if (rel.toEntity === node && !rel.manualConstraint) {
                neighbors.push({
                    node: rel.fromEntity,
                    relation: rel
                });
            }
        });
        return neighbors;
    }
    hasPath(from, to) {
        return this.find(from, to) !== null;
    }
    getReachableNodes(from, maxDistance) {
        const reachable = new Set();
        const queue = [{ node: from, distance: 0 }];
        const visited = new Set();
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current.node))
                continue;
            visited.add(current.node);
            reachable.add(current.node);
            if (maxDistance !== undefined && current.distance >= maxDistance) {
                continue;
            }
            const neighbors = this.getNeighbors(current.node);
            neighbors.forEach(({ node }) => {
                if (!visited.has(node)) {
                    queue.push({
                        node,
                        distance: current.distance + 1
                    });
                }
            });
        }
        reachable.delete(from);
        return Array.from(reachable);
    }
}
//# sourceMappingURL=PathFinder.js.map
export function findPath(graph, from, to) {
    const direct = graph.relations.find(r => r.fromEntity === from && r.toEntity === to);
    if (direct) {
        return [direct];
    }
    const queue = [{ node: from, path: [] }];
    const visited = new Set([from]);
    while (queue.length > 0) {
        const { node, path } = queue.shift();
        const outgoing = graph.relations
            .filter(r => r.fromEntity === node && !r.blocked)
            .sort((a, b) => a.weight - b.weight);
        for (const rel of outgoing) {
            if (visited.has(rel.toEntity))
                continue;
            const newPath = [...path, rel];
            if (rel.toEntity === to) {
                return newPath;
            }
            visited.add(rel.toEntity);
            queue.push({ node: rel.toEntity, path: newPath });
        }
    }
    return null;
}
//# sourceMappingURL=findPath.js.map
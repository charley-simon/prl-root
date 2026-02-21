export function dijkstra(graph, from, to) {
    const distances = new Map();
    const previous = new Map();
    const unvisited = new Set();
    graph.relations.forEach(r => {
        unvisited.add(r.fromEntity);
        unvisited.add(r.toEntity);
    });
    distances.set(from, 0);
    previous.set(from, null);
    while (unvisited.size > 0) {
        let current = null;
        let minDist = Infinity;
        for (const node of unvisited) {
            const dist = distances.get(node) ?? Infinity;
            if (dist < minDist) {
                minDist = dist;
                current = node;
            }
        }
        if (!current || minDist === Infinity)
            break;
        unvisited.delete(current);
        if (current === to)
            break;
        const outgoing = graph.relations.filter(r => r.fromEntity === current && !r.blocked);
        for (const rel of outgoing) {
            const alt = minDist + rel.weight;
            const currentDist = distances.get(rel.toEntity) ?? Infinity;
            if (alt < currentDist) {
                distances.set(rel.toEntity, alt);
                previous.set(rel.toEntity, { node: current, relation: rel });
            }
        }
    }
    if (!previous.has(to) || previous.get(to) === null) {
        return null;
    }
    const path = [];
    let current = to;
    while (previous.get(current)) {
        const prev = previous.get(current);
        path.unshift(prev.relation);
        current = prev.node;
    }
    return path;
}
//# sourceMappingURL=dijkstra.js.map
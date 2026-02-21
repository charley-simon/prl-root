export function findAllPaths(graph, from, to, maxPaths = 5, maxHops = 30) {
    const allPaths = [];
    function dfs(current, path, visited) {
        if (path.length >= maxHops)
            return;
        if (allPaths.length >= maxPaths)
            return;
        if (current === to && path.length > 0) {
            allPaths.push([...path]);
            return;
        }
        const outgoing = graph.relations
            .filter(r => r.fromEntity === current && !r.blocked)
            .sort((a, b) => a.weight - b.weight);
        for (const rel of outgoing) {
            if (visited.has(rel.toEntity))
                continue;
            visited.add(rel.toEntity);
            path.push(rel);
            dfs(rel.toEntity, path, visited);
            path.pop();
            visited.delete(rel.toEntity);
        }
    }
    dfs(from, [], new Set([from]));
    return allPaths;
}
//# sourceMappingURL=findAllPaths.js.map
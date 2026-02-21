import { Engine, GraphBuilder } from '../index';
async function example1_SimplePathfinding() {
    console.log('\n=== Example 1: Simple Pathfinding ===\n');
    const graph = new GraphBuilder().addEntity('Stations').build();
    graph.relations.push({ name: 'A-B', fromEntity: 'Station-A', toEntity: 'Station-B', via: 'line-1', weight: 2 }, { name: 'B-C', fromEntity: 'Station-B', toEntity: 'Station-C', via: 'line-1', weight: 3 }, { name: 'C-D', fromEntity: 'Station-C', toEntity: 'Station-D', via: 'line-1', weight: 2 });
    const engine = Engine.forPathfinding(graph, {
        from: 'Station-A',
        to: 'Station-D',
        maxPaths: 5
    });
    const results = await engine.run();
    if (results[0].path) {
        console.log('Path found:');
        console.log(`  Nodes: ${results[0].path.nodes.join(' → ')}`);
        console.log(`  Total weight: ${results[0].path.totalWeight}`);
    }
}
example1_SimplePathfinding().catch(console.error);
//# sourceMappingURL=usage-example.js.map
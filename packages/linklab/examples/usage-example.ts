// examples/usage-example.ts

/**
 * Complete usage examples for LinkLab Core
 */

import { Engine, GraphBuilder, templates } from '../src/index'

// ==================== EXAMPLE 1: Simple Pathfinding ====================

async function example1_SimplePathfinding() {
  console.log('\n=== Example 1: Simple Pathfinding ===\n')

  // Create a simple graph
  const graph = new GraphBuilder().addEntity('Stations').build()

  // Add some manual relations
  graph.relations.push(
    { name: 'A-B', fromEntity: 'Station-A', toEntity: 'Station-B', via: 'line-1', weight: 2 },
    { name: 'B-C', fromEntity: 'Station-B', toEntity: 'Station-C', via: 'line-1', weight: 3 },
    { name: 'C-D', fromEntity: 'Station-C', toEntity: 'Station-D', via: 'line-1', weight: 2 }
  )

  // Create pathfinding engine
  const engine = Engine.forPathfinding(graph, {
    from: 'Station-A',
    to: 'Station-D',
    maxPaths: 5
  })

  // Run
  const results = await engine.run()

  if (results[0].path) {
    console.log('Path found:')
    console.log(`  Nodes: ${results[0].path.nodes.join(' → ')}`)
    console.log(`  Total weight: ${results[0].path.totalWeight}`)
  }
}

// Run
example1_SimplePathfinding().catch(console.error)

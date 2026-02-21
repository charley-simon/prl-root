// packages/linklab/src/core/Engine.test.ts
import { describe, it, expect } from 'vitest'
import { Engine } from './Engine'
import { GraphBuilder } from '../builders/GraphBuilder'

describe('Engine', () => {
  describe('forPathfinding', () => {
    it('should create pathfinding engine', () => {
      const graph = new GraphBuilder().addEntity('Stations').build()

      const engine = Engine.forPathfinding(graph, {
        from: 'A',
        to: 'B'
      })

      expect(engine).toBeDefined()
      expect(engine.getMode()).toBe('PATHFIND')
    })
  })

  describe('pathfinding', () => {
    it('should find simple path', async () => {
      const graph = new GraphBuilder().addEntity('Stations').build()

      // Add manual relations
      graph.relations.push(
        { name: 'A-B', fromEntity: 'A', toEntity: 'B', via: 'line1', weight: 2 },
        { name: 'B-C', fromEntity: 'B', toEntity: 'C', via: 'line1', weight: 3 }
      )

      const engine = Engine.forPathfinding(graph, {
        from: 'A',
        to: 'C',
        maxPaths: 5
      })

      const results = await engine.run()

      expect(results).toHaveLength(1)
      expect(results[0].path).toBeDefined()
      expect(results[0].path?.nodes).toEqual(['A', 'B', 'C'])
      expect(results[0].path?.totalWeight).toBe(5)
    })
  })
})

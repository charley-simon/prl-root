// src/core/PathFinder.ts

import type { Graph, Relation, Path } from '../types'

/**
 * PathFinder - Find paths in a graph with bidirectional navigation
 *
 * Automatically explores relations in both directions unless explicitly blocked
 */
export class PathFinder {
  constructor(private graph: Graph) {}

  /**
   * Find a single path between two nodes
   */
  find(from: string, to: string): Path | null {
    const paths = this.findAll(from, to, 1)
    return paths.length > 0 ? paths[0] : null
  }

  /**
   * Find multiple paths between two nodes
   */
  findAll(from: string, to: string, maxPaths: number = 5): Path[] {
    const paths: Path[] = []
    const queue: Array<{
      path: string[]
      relations: Relation[]
      weight: number
    }> = [{ path: [from], relations: [], weight: 0 }]

    const visited = new Set<string>()

    while (queue.length > 0 && paths.length < maxPaths) {
      const current = queue.shift()!
      const lastNode = current.path[current.path.length - 1]

      // Found target
      if (lastNode === to) {
        paths.push({
          nodes: current.path,
          relations: current.relations,
          totalWeight: current.weight
        })
        continue
      }

      // Avoid revisiting same node in this path
      const pathKey = current.path.join('→')
      if (visited.has(pathKey + lastNode)) continue
      visited.add(pathKey + lastNode)

      // ✅ Get neighbors in BOTH directions
      const neighbors = this.getNeighbors(lastNode)

      neighbors.forEach(({ node, relation }) => {
        // Don't revisit nodes in current path
        if (!current.path.includes(node)) {
          queue.push({
            path: [...current.path, node],
            relations: [...current.relations, relation],
            weight: current.weight + relation.weight
          })
        }
      })
    }

    // Sort by weight (shortest first)
    return paths.sort((a, b) => a.totalWeight - b.totalWeight)
  }

  /**
   * Get all neighbors of a node (bidirectional)
   *
   * Explores relations in both forward and reverse directions
   * unless the relation has manualConstraint = true
   */
  private getNeighbors(node: string): Array<{
    node: string
    relation: Relation
  }> {
    const neighbors: Array<{ node: string; relation: Relation }> = []

    this.graph.relations.forEach(rel => {
      // Forward direction (from → to)
      if (rel.fromEntity === node) {
        neighbors.push({
          node: rel.toEntity,
          relation: rel
        })
      }

      // ✅ Reverse direction (to → from)
      // Only if NOT manually constrained to one direction
      if (rel.toEntity === node && !rel.manualConstraint) {
        neighbors.push({
          node: rel.fromEntity,
          relation: rel // ✅ Garder la relation telle quelle
        })
      }
    })

    return neighbors
  }

  /**
   * Check if a path exists between two nodes
   */
  hasPath(from: string, to: string): boolean {
    return this.find(from, to) !== null
  }

  /**
   * Get all nodes reachable from a starting node
   */
  getReachableNodes(from: string, maxDistance?: number): string[] {
    const reachable = new Set<string>()
    const queue: Array<{ node: string; distance: number }> = [{ node: from, distance: 0 }]
    const visited = new Set<string>()

    while (queue.length > 0) {
      const current = queue.shift()!

      if (visited.has(current.node)) continue
      visited.add(current.node)

      reachable.add(current.node)

      if (maxDistance !== undefined && current.distance >= maxDistance) {
        continue
      }

      const neighbors = this.getNeighbors(current.node)
      neighbors.forEach(({ node }) => {
        if (!visited.has(node)) {
          queue.push({
            node,
            distance: current.distance + 1
          })
        }
      })
    }

    reachable.delete(from) // Remove starting node
    return Array.from(reachable)
  }
}

// algorithms/dijkstra.ts

import type { Graph, Relation } from '../types'

/**
 * Dijkstra classique (si vraiment nécessaire)
 * Mais findPath.ts (BFS) suffit pour vous
 */
export function dijkstra(graph: Graph, from: string, to: string): Relation[] | null {
  const distances = new Map<string, number>()
  const previous = new Map<string, { node: string; relation: Relation } | null>()
  const unvisited = new Set<string>()

  // Init
  graph.relations.forEach(r => {
    unvisited.add(r.fromEntity)
    unvisited.add(r.toEntity)
  })

  distances.set(from, 0)
  previous.set(from, null)

  while (unvisited.size > 0) {
    // Nœud avec distance minimale
    let current: string | null = null
    let minDist = Infinity

    for (const node of unvisited) {
      const dist = distances.get(node) ?? Infinity
      if (dist < minDist) {
        minDist = dist
        current = node
      }
    }

    if (!current || minDist === Infinity) break

    unvisited.delete(current)

    if (current === to) break

    // Voisins
    const outgoing = graph.relations.filter(r => r.fromEntity === current && !r.blocked)

    for (const rel of outgoing) {
      const alt = minDist + rel.weight
      const currentDist = distances.get(rel.toEntity) ?? Infinity

      if (alt < currentDist) {
        distances.set(rel.toEntity, alt)
        previous.set(rel.toEntity, { node: current, relation: rel })
      }
    }
  }

  // Reconstruction du chemin
  if (!previous.has(to) || previous.get(to) === null) {
    return null
  }

  const path: Relation[] = []
  let current = to

  while (previous.get(current)) {
    const prev = previous.get(current)!
    path.unshift(prev.relation)
    current = prev.node
  }

  return path
}

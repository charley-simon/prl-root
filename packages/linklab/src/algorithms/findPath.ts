// algorithms/findPath.ts

import type { Graph, Relation } from '../types'

/**
 * Trouve UN chemin entre from et to
 * Suit les poids (plus petit = meilleur)
 *
 * Simple BFS ou Dijkstra allégé
 */
export function findPath(graph: Graph, from: string, to: string): Relation[] | null {
  // 1. Chemin direct ?
  const direct = graph.relations.find(r => r.fromEntity === from && r.toEntity === to)

  if (direct) {
    return [direct] // Chemin le plus court (1 hop)
  }

  // 2. Sinon, chercher via BFS (breadth-first)
  const queue: { node: string; path: Relation[] }[] = [{ node: from, path: [] }]

  const visited = new Set<string>([from])

  while (queue.length > 0) {
    const { node, path } = queue.shift()!

    // Relations sortantes de ce nœud
    const outgoing = graph.relations
      .filter(r => r.fromEntity === node && !r.blocked)
      .sort((a, b) => a.weight - b.weight) // Poids croissant

    for (const rel of outgoing) {
      if (visited.has(rel.toEntity)) continue

      const newPath = [...path, rel]

      // Trouvé ?
      if (rel.toEntity === to) {
        return newPath
      }

      // Continue
      visited.add(rel.toEntity)
      queue.push({ node: rel.toEntity, path: newPath })
    }
  }

  return null // Pas de chemin
}

// algorithms/findAllPaths.ts

import type { Graph, Relation } from '../types'

/**
 * Trouve TOUS les chemins entre from et to
 * Limité à maxPaths et maxHops
 */
export function findAllPaths(
  graph: Graph,
  from: string,
  to: string,
  maxPaths = 5,
  maxHops = 30
): Relation[][] {
  const allPaths: Relation[][] = []

  function dfs(current: string, path: Relation[], visited: Set<string>) {
    // Limite atteinte
    if (path.length >= maxHops) return
    if (allPaths.length >= maxPaths) return

    // Trouvé ?
    if (current === to && path.length > 0) {
      allPaths.push([...path])
      return
    }

    // Continuer
    const outgoing = graph.relations
      .filter(r => r.fromEntity === current && !r.blocked)
      .sort((a, b) => a.weight - b.weight)

    for (const rel of outgoing) {
      if (visited.has(rel.toEntity)) continue // Éviter cycles

      visited.add(rel.toEntity)
      path.push(rel)

      dfs(rel.toEntity, path, visited)

      path.pop()
      visited.delete(rel.toEntity)
    }
  }

  dfs(from, [], new Set([from]))

  return allPaths
}

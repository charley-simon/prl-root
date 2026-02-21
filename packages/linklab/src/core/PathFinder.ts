// core/PathFinder.ts

import type { Graph, Path, Relation } from '../types'
import { findPath } from '../algorithms/findPath'
import { findAllPaths } from '../algorithms/findAllPaths'

export class PathFinder {
  constructor(private graph: Graph) {}

  /**
   * Trouve le meilleur chemin (poids minimal)
   */
  findBest(from: string, to: string): Path | null {
    const relations = findPath(this.graph, from, to)

    if (!relations) return null

    return this.buildPath(relations, from, to)
  }

  /**
   * Trouve tous les chemins (trié par poids)
   */
  findAll(from: string, to: string, maxPaths = 5): Path[] {
    const allRelations = findAllPaths(this.graph, from, to, maxPaths)

    return allRelations
      .map(rels => this.buildPath(rels, from, to))
      .sort((a, b) => a.totalWeight - b.totalWeight)
  }

  /**
   * Construit un Path depuis une liste de Relations
   */
  private buildPath(relations: Relation[], from: string, to: string): Path {
    const nodes = [from]

    for (const rel of relations) {
      nodes.push(rel.toEntity)
    }

    const totalWeight = relations.reduce((sum, r) => sum + r.weight, 0)

    return { nodes, relations, totalWeight }
  }
}

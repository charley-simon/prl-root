// graph/Graph.ts

import type { Graph, Relation, PathQuery, Path } from '../types'
import { findPath } from '../algorithms/findPath'

export class AdaptiveGraph {
  private mutableGraph: Graph // Version mutable interne

  constructor(graph: Graph) {
    // Clone pour rendre mutable
    this.mutableGraph = {
      ...graph,
      relations: graph.relations.map(r => ({ ...r }))
    }
  }

  getGraph(): Graph {
    return this.mutableGraph
  }

  /**
   * Entraîne le graph sur un ensemble de requêtes
   */
  train(queries: PathQuery[]): void {
    console.log(`[Graph] Training on ${queries.length} queries...`)

    for (const query of queries) {
      const relations = findPath(this.mutableGraph, query.from, query.to)

      if (relations) {
        relations.forEach((rel: Relation) => {
          const relation = this.mutableGraph.relations.find(r => r.name === rel.name)
          if (relation && !relation.manualConstraint) {
            relation.usageCount = (relation.usageCount || 0) + 1
            relation.weight = Math.max(1, relation.weight * 0.95)
          }
        })
      } else {
        console.warn(`[Graph] No path for ${query.from} → ${query.to}`)
      }
    }

    this.simplify()
  }

  /**
   * Simplifie le graph
   */
  private simplify(): void {
    const before = this.mutableGraph.relations.length

    this.mutableGraph = {
      ...this.mutableGraph,
      relations: this.mutableGraph.relations.filter(rel => {
        if (rel.manualConstraint) return true
        return (rel.usageCount || 0) > 0
      })
    }

    const after = this.mutableGraph.relations.length
    console.log(`[Graph] Simplified: ${before} → ${after} relations`)
  }

  /**
   * Adapte dynamiquement
   */
  adapt(relationName: string, blocked: boolean): void {
    const rel = this.mutableGraph.relations.find(r => r.name === relationName)

    if (!rel || rel.manualConstraint) return

    if (blocked) {
      rel.blocked = true
      rel.weight = rel.weight * 2
      console.log(`[Graph] Blocked ${rel.name}, weight: ${rel.weight}`)
    } else {
      rel.usageCount = (rel.usageCount || 0) + 1
      rel.weight = Math.max(1, rel.weight * 0.98)
    }
  }

  /**
   * Export pour production
   */
  export(): Graph {
    return {
      ...this.mutableGraph,
      metadata: {
        version: '1.0',
        trainedOn: new Date().toISOString(),
        totalQueries: this.mutableGraph.relations.reduce((sum, r) => sum + (r.usageCount || 0), 0)
      }
    }
  }
}

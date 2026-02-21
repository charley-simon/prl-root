// core/ContextualExplorer.ts

import type {
  Graph,
  Frame,
  AvailablePath,
  RelationPath,
  Suggestion,
  Relation,
  RelationInstance,
  Pattern
} from '../../../../linklab/src'
import { findAllPaths } from '../algorithms/findAllPaths'

export class ContextualExplorer {
  constructor(private graph: Graph) {}

  /**
   * Chemins disponibles depuis la position actuelle
   */
  getAvailablePaths(entity: string, id: number): AvailablePath[] {
    const outgoing = this.graph.relations.filter(r => r.fromEntity === entity && !r.blocked)

    return outgoing
      .sort((a, b) => a.weight - b.weight)
      .map(rel => ({
        relation: rel,
        label: this.generateLabel(rel),
        preview: this.generatePreview(rel, id),
        count: this.estimateCount(rel, id)
      }))
  }

  /**
   * Toutes les relations entre 2 entités du contexte
   */
  findAllRelationsBetween(
    from: { entity: string; id: number },
    to: { entity: string; id: number },
    maxPaths = 10
  ): RelationPath[] {
    const allPaths = findAllPaths(this.graph, from.entity, to.entity, maxPaths, 3)

    return allPaths
      .map(relations => {
        const instances = this.resolveInstances(relations, from.id, to.id)
        const weight = relations.reduce((sum, r) => sum + r.weight, 0)

        return {
          path: relations,
          instances,
          summary: this.generateSummary(relations, instances),
          weight
        }
      })
      .sort((a, b) => a.weight - b.weight)
  }

  /**
   * Suggestions contextuelles
   */
  getContextualSuggestions(stack: Frame[]): Suggestion[] {
    const suggestions: Suggestion[] = []

    // 1. Explorer depuis position actuelle
    const current = stack[stack.length - 1]
    if (current?.id) {
      const paths = this.getAvailablePaths(current.entity, current.id)

      if (paths.length > 0) {
        suggestions.push({
          type: 'EXPLORE',
          label: `Explorer depuis ${current.entity}`,
          options: paths
        })
      }
    }

    // 2. Relations entre éléments du contexte
    if (stack.length >= 2) {
      for (let i = 0; i < stack.length - 1; i++) {
        for (let j = i + 1; j < stack.length; j++) {
          const a = stack[i]
          const b = stack[j]

          if (!a.id || !b.id) continue

          const relations = this.findAllRelationsBetween(
            { entity: a.entity, id: a.id },
            { entity: b.entity, id: b.id }
          )

          if (relations.length > 1) {
            suggestions.push({
              type: 'DISCOVER',
              label: `Autres liens entre ${a.entity} et ${b.entity}`,
              options: relations
            })
          }
        }
      }
    }

    // 3. Patterns
    const patterns = this.detectPatterns(stack)
    if (patterns.length > 0) {
      suggestions.push({
        type: 'PATTERN',
        label: 'Patterns détectés',
        options: patterns
      })
    }

    return suggestions
  }

  // ==================== HELPERS ====================

  private generateLabel(relation: Relation): string {
    const labels: Record<string, string> = {
      'actors-movies': 'Filmographie',
      'actors-directors': 'Réalisateurs',
      'actors-actors': 'Co-stars',
      'movies-actors': 'Acteurs',
      'directors-movies': 'Films réalisés'
    }

    return labels[relation.name] || relation.toEntity
  }

  private generatePreview(relation: Relation, id: number): string {
    const count = this.estimateCount(relation, id)
    return `${count} ${relation.toEntity.toLowerCase()}`
  }

  private estimateCount(relation: Relation, id: number): number {
    // TODO: Vraie requête DB
    return Math.floor(Math.random() * 50) + 1
  }

  private resolveInstances(
    relations: Relation[],
    fromId: number,
    toId: number
  ): RelationInstance[] {
    // TODO: Vraie résolution
    return [
      { id: 1, label: 'Instance 1' },
      { id: 2, label: 'Instance 2' }
    ]
  }

  private generateSummary(relations: Relation[], instances: RelationInstance[]): string {
    const via = relations.map(r => r.via).join(' → ')
    return `${instances.length} via ${via}`
  }

  private detectPatterns(stack: Frame[]): Pattern[] {
    // TODO: Vraie détection
    return []
  }
}

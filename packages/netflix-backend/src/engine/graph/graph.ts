// graph.ts
import type { Filter } from '../stores/types'

export interface Relation {
  name: string
  fromEntity: string
  toEntity: string
  via: string
  constraintFilters?: Filter[]
}

// graphe précompilé minimal pour exemple
export const precompiledGraph: Relation[] = [
  { name: 'people-director-movies', fromEntity: 'People', toEntity: 'Movie', via: 'Movie-People' },
  { name: 'movie-actors', fromEntity: 'Movie', toEntity: 'People', via: 'Movie-People' },
  { name: 'people-actor-movies', fromEntity: 'People', toEntity: 'Movie', via: 'Movie-People' }
]

// resolver.ts
import { StackStore } from '../stores/stackStore'
import { Frame, ResolvedBy, Filter } from '../stores/types'
import { precompiledGraph, Relation } from './graph'

export class Resolver {
  constructor(private stackStore: StackStore) {}

  resolveContext() {
    const stack = this.stackStore.getFrames()

    stack.forEach((frame, index) => {
      if (frame.state === 'UNRESOLVED') {
        const resolvedBy = this.selectBestCandidate(frame, stack, index)
        if (resolvedBy) {
          frame.resolvedBy = resolvedBy
          frame.state = 'RESOLVED'
          this.stackStore.updateFrame(index, frame)
        }
      }
    })
  }

  private selectBestCandidate(
    frame: Frame,
    stack: Frame[],
    currentIndex: number
  ): ResolvedBy | null {
    // Exemple simple: on parcourt le graphe précompilé pour trouver une relation pertinente
    const candidate = precompiledGraph.find(
      rel =>
        rel.fromEntity === this.getParentEntity(stack, currentIndex) &&
        rel.toEntity === frame.entity
    )
    if (!candidate) return null

    // Génération dynamique des filtres basiques
    const filters: Filter[] = []
    const parentFrame = stack[currentIndex - 1]
    if (parentFrame && parentFrame.id) {
      if (candidate.fromEntity === 'People')
        filters.push({ field: 'peopleId', value: parentFrame.id })
      if (candidate.fromEntity === 'Movie')
        filters.push({ field: 'movieId', value: parentFrame.id })
      if (frame.intent.role) filters.push({ field: 'roleId', value: frame.intent.role })
    }

    return {
      relation: candidate.name,
      via: candidate.via,
      filters
    }
  }

  private getParentEntity(stack: Frame[], currentIndex: number): string | null {
    if (currentIndex === 0) return null
    return stack[currentIndex - 1].entity
  }
}

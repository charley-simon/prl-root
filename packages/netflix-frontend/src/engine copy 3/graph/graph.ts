// graph.ts
import type { Filter } from '../core/types'

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

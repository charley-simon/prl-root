// engine/stores/types.ts
export type TableName = 'Movies' | 'Actors' | 'Directors'

export interface StackElem {
  table: string
  id: number | null
  label: string
  views: string[]
  anchor?: string
}

export type Movie = { id: number; title: string }
export type People = { id: number; name: string }
export type Actor = { id: number; name: string }
export type Director = { id: number; name: string }
export type Jobs = { id: number; name: string }
export type MoviePeople = { movieId: number; peopleId: number; jobId: number }

export interface Filter {
  field: string
  value: any
}

export interface Relation {
  name: string
  fromEntity: string
  toEntity: string
  via: string
  constraintFilters?: Filter[]
}

export interface ResolvedBy {
  relation: string
  via: string
  filters: Filter[]
}

export interface Frame {
  entity: string
  id?: number
  purpose: string
  intent: Record<string, any>
  state: 'RESOLVED' | 'UNRESOLVED'
  resolvedBy: ResolvedBy | null
}

// ------------------- TYPES POUR ENGINE -------------------

// Un graphe simplifié pour le moteur
export interface Graph {
  relations: Relation[]
}

// Une action que le moteur peut exécuter
export interface Action {
  name: string
  inputs?: string[] // types d'entités nécessaires
  contextRequired?: string[] // champs requis dans la pile
  weight?: number // priorité
  WHEN?: string // condition (expression JS simple)
  onUse?: (result: any) => void
  execute?: () => { type: 'SUCCESS' | 'FAIL'; reason?: string }
  cooldown?: number
  cooldownUntil?: number
  retryCount?: number
  executed?: boolean
}

// Le résultat d'une étape du moteur
export interface EngineStepResult {
  time: number
  state: 'RESOLVED' | 'UNRESOLVED' | 'RETRY_LATER' | 'UNAVAILABLE'
  retryCount: number
  deferredJobs: Action[]
  executedAction: string | null
}

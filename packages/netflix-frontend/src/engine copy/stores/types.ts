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

export type EngineResult = {
  type: 'SUCCESS' | 'FAIL' | 'DEFER'
  [key: string]: any
}

export interface Action {
  name: string
  weight?: number
  WHEN?: string | ((ctx: Record<string, Frame>, stack: Frame[]) => boolean)
  execute?: (stack: Frame[]) => EngineResult | Promise<EngineResult>
  onUse?: (stack: Frame[]) => void
  cooldown?: number
  executed?: boolean
  retryCount?: number
  cooldownUntil?: number
}

export interface EngineStepResult {
  time: number
  retryCount: number
  deferredJobs: Action[]
  executedAction?: string
}

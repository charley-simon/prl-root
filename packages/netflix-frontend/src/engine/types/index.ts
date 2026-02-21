// types/index.ts

export type Graph = {
  relations: Relation[]
  metadata?: GraphMetadata
}

export type Relation = {
  readonly name: string
  readonly fromEntity: string
  readonly toEntity: string
  readonly via: string
  weight: number
  readonly constraintFilters?: Filter[]
  readonly manualConstraint?: boolean
  usageCount?: number
  blocked?: boolean
  metadata?: RelationMetadata
}

export type RelationMetadata = {
  type?: 'DIRECT' | 'TRANSFER' | string
  lineId?: string
  lineName?: string
  direction?: string
  travelTimeMinutes?: number
  travelTimeSeconds?: number
  fromLine?: string
  toLine?: string
  walkTimeMinutes?: number
  walkTimeSeconds?: number
  [key: string]: any
}

export type GraphMetadata = {
  source?: string
  date?: string
  description?: string
  [key: string]: any
}

export type Filter = {
  field: string
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'exists'
  value: any
}

export type Frame = {
  entity: string
  id?: string
  state?: 'RESOLVED' | 'UNRESOLVED' | 'DEFERRED'
  data?: any
  filters?: Filter[]
}

export type Path = {
  nodes: string[]
  relations: Relation[]
  totalWeight: number
}

export type EngineMode = 'PATHFIND' | 'SCHEDULE' | 'NAVIGATE'

export type PathQuery = {
  from: string
  to: string
  maxPaths?: number
  maxHops?: number
  preferences?: PathPreferences
}

export type PathPreferences = {
  minimizeTransfers?: boolean
  avoidLines?: string[]
  preferExpress?: boolean
  maxTransfers?: number
  accessible?: boolean
  [key: string]: any
}

export type ActionDefinition = {
  name: string
  weight: number
  when?: (stack: Frame[]) => boolean
  execute: (stack: Frame[], graph: Graph) => Promise<Frame[]>
  cooldown?: number
  maxExecutions?: number
}

export type EngineConfig = {
  mode: EngineMode
  graph: Graph
  initialStack?: Frame[]
  actions?: ActionDefinition[]
  pathQuery?: PathQuery
}

export type EngineStepResult = {
  time: number
  mode: EngineMode
  phase?: string
  selectedAction?: string
  resolvedCount?: number
  unresolvedCount?: number
  path?: Path
  result?: {
    type: 'SUCCESS' | 'FAIL'
    reason?: string
    data?: any
  }
}

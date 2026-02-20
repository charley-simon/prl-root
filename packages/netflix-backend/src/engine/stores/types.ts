// types.ts
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

export interface Frame {
  entity: string
  id?: number
  purpose: string
  intent: Record<string, any>
  state: 'RESOLVED' | 'UNRESOLVED'
  resolvedBy: ResolvedBy | null
}

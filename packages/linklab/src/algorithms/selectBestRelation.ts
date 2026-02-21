// algorithms/selectBestRelation.ts

import type { Frame, Filter, Relation } from '../types'

export function selectBestRelation(
  frame: Frame,
  stack: Frame[],
  relations: Relation[]
): { relation: Relation; sourceFrame: Frame } | null {
  const resolvedFrames = [...stack]
    .reverse()
    .filter(f => f.state === 'RESOLVED' && f.id !== undefined && f.id !== null)

  for (const source of resolvedFrames) {
    const candidates = relations.filter(
      rel =>
        rel.toEntity === frame.entity &&
        rel.fromEntity === source.entity &&
        constraintsMatch(frame.intent || {}, rel.constraintFilters)
    )

    if (candidates.length > 0) {
      return {
        relation: candidates[0],
        sourceFrame: source
      }
    }
  }

  return null
}

function constraintsMatch(intent: Record<string, any>, filters?: Filter[]): boolean {
  if (!filters || filters.length === 0) return true

  return filters.every(f => {
    if (intent[f.field] === undefined) return true
    return intent[f.field] === f.value
  })
}

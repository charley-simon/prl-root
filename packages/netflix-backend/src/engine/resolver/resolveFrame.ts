import type { Frame } from '../stores/types'
import type { Relation } from '../graph'
import { selectBestRelation } from './selectBestRelation'

export function resolveFrame(frame: Frame, stack: Frame[], graph: Relation[]): Frame {
  // Sécurité
  if (frame.state === 'RESOLVED') {
    return frame
  }

  const candidate = selectBestRelation(frame, stack, graph)

  if (!candidate) {
    // volontairement non bloquant
    console.warn(`[Resolver] No relation found for ${frame.entity}`, frame.intent)
    return frame
  }

  const { relation, sourceFrame } = candidate

  return {
    ...frame,
    state: 'RESOLVED',
    resolvedBy: {
      relation: relation.name,
      via: relation.via,
      filters: [
        { field: `${sourceFrame.entity.toLowerCase()}Id`, value: sourceFrame.id },
        ...(relation.constraintFilters ?? [])
      ]
    }
  }
}

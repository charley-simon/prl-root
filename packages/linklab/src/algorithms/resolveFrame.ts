// algorithms/resolveFrame.ts

import type { Frame, Relation } from '../types'
import { selectBestRelation } from './selectBestRelation'

export function resolveFrame(frame: Frame, stack: Frame[], relations: Relation[]): Frame {
  // Déjà résolu
  if (frame.state === 'RESOLVED') {
    return frame
  }

  // Chercher la meilleure relation
  const candidate = selectBestRelation(frame, stack, relations)

  if (!candidate) {
    console.warn(`[Resolver] No relation found for ${frame.entity}`, frame.intent)
    return frame
  }

  const { relation, sourceFrame } = candidate

  // Retourner frame résolu
  return {
    ...frame,
    state: 'RESOLVED',
    resolvedBy: {
      relation: relation.name,
      via: relation.via,
      filters: [
        {
          field: `${sourceFrame.entity.toLowerCase()}Id`,
          operator: 'equals', // ✅ AJOUTER
          value: sourceFrame.id!
        },
        ...(relation.constraintFilters ?? [])
      ]
    }
  }
}

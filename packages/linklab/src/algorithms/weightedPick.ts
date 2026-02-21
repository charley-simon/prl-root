// algorithms/weightedPick.ts

import type { ActionDefinition } from '../types'

export function weightedPick(actions: ActionDefinition[]): ActionDefinition | null {
  if (actions.length === 0) return null

  const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0)
  let random = Math.random() * totalWeight

  for (const action of actions) {
    random -= action.weight
    if (random <= 0) return action
  }

  return actions[actions.length - 1]
}

// src/core/Resolver.ts

import type { Frame, Graph } from '../types'
import { Logger } from '../utils/Logger'
import { resolveFrame } from '../algorithms/resolveFrame'

export class Resolver {
  private logger = new Logger()

  constructor(private graph: Graph) {}

  async resolve(stack: Frame[]): Promise<Frame[]> {
    const unresolved = stack.filter(f => f.state === 'UNRESOLVED')

    if (unresolved.length === 0) {
      return stack
    }

    const frame = unresolved[0]

    try {
      const resolved = await resolveFrame(frame, stack, this.graph.relations)

      if (resolved) {
        // Replace unresolved with resolved
        return stack.map(f => (f === frame ? resolved : f))
      } else {
        // Mark as deferred
        return stack.map(f => (f === frame ? { ...f, state: 'DEFERRED' as const } : f))
      }
    } catch (error) {
      this.logger.error(`Failed to resolve frame ${frame.entity}`, error)

      // Mark as deferred on error
      return stack.map(f => (f === frame ? { ...f, state: 'DEFERRED' as const } : f))
    }
  }
}

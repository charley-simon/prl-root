import type { Relation } from '../graph'
import type { StackStore } from '../stores/stackStore'
import { resolveFrame } from './resolveFrame'

export class Resolver {
  constructor(
    private stackStore: StackStore,
    private graph: Relation[]
  ) {}

  resolveContext(): void {
    const frames = this.stackStore.getFrames()

    let hasResolvedSomething = true

    // Boucle tant qu'on progresse
    while (hasResolvedSomething) {
      hasResolvedSomething = false

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i]

        if (frame.state === 'UNRESOLVED') {
          const resolved = resolveFrame(frame, frames, this.graph)

          if (resolved.state === 'RESOLVED') {
            this.stackStore.updateFrame(i, resolved)
            hasResolvedSomething = true

            console.log(`[Resolver] RESOLVED ${frame.entity}`, resolved.resolvedBy)
          }
        }
      }
    }
  }
}

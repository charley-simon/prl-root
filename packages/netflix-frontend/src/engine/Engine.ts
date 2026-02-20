// engine/Engine.ts

import type { Action, Frame, EngineResult, EngineStepResult } from './stores/types'

export class Engine {
  private stack: Frame[]
  private actions: Action[]
  private time = 0
  private retryCount = 0
  private deferredJobs: Action[] = []

  constructor(params: { context: Frame[]; actions: Action[]; graph?: any }) {
    this.stack = params.context
    this.actions = params.actions
  }

  async run(maxSteps = 50): Promise<EngineStepResult[]> {
    const results: EngineStepResult[] = []

    for (let i = 0; i < maxSteps; i++) {
      const step = await this.step()
      results.push(step)

      // Stop si aucune action dispo et pas de deferred
      if (!step.executedAction && this.deferredJobs.length === 0) {
        break
      }
    }

    return results
  }

  private async step(): Promise<EngineStepResult> {
    this.time++

    const available = this.actions
      .filter(a => !a.executed)
      .filter(a => {
        if (!a.WHEN) return true

        if (typeof a.WHEN === 'function') {
          return a.WHEN({}, this.stack)
        }

        // Si WHEN est string
        return Function('stack', `return (${a.WHEN})`)(this.stack)
      })
      .filter(a => {
        if (!a.cooldownUntil) return true
        return this.time >= a.cooldownUntil
      })
      .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))

    if (available.length === 0) {
      return {
        time: this.time,
        retryCount: this.retryCount,
        deferredJobs: this.deferredJobs
      }
    }

    const selected = available[0]

    let result: EngineResult = { type: 'SUCCESS' }

    if (selected.execute) {
      result = await selected.execute(this.stack)
    }

    if (result.type === 'SUCCESS') {
      selected.executed = true
      selected.onUse?.(this.stack)
    }

    if (result.type === 'DEFER') {
      selected.cooldownUntil = this.time + (selected.cooldown ?? 1)
      this.deferredJobs.push(selected)
    }

    return {
      time: this.time,
      retryCount: this.retryCount,
      deferredJobs: this.deferredJobs,
      executedAction: selected.name
    }
  }

  public getStack() {
    return this.stack
  }
}

// Engine.ts
import type { Action } from './core/types'

export type Frame = {
  entity: string
  id: number
  state: string
  purpose?: string
  intent?: Record<string, any>
}

export type EngineResultType = 'SUCCESS' | 'DEFER' | 'FAIL'

export type EngineResult = {
  type: EngineResultType
  [key: string]: any
}

export type EngineStepResult = {
  time: number
  selectedAction?: string
  result?: EngineResult
  retryCount: number
  deferredJobs: string[]
}

type EngineConfig = {
  actions: Action[]
  stack?: Frame[]
}

export class Engine {
  private actions: Action[]
  private time = 0
  private stack: Frame[]
  private retryCount = 0

  constructor(config: EngineConfig) {
    this.actions = config.actions
    this.stack = config.stack ?? []
  }

  getStack() {
    return this.stack
  }

  async run(steps: number): Promise<EngineStepResult[]> {
    const results: EngineStepResult[] = []
    for (let i = 0; i < steps; i++) {
      const res = await this.step()
      results.push(res)
    }
    return results
  }

  private async step(): Promise<EngineStepResult> {
    this.time++

    const available = this.getAvailableActions()

    if (available.length === 0) {
      this.retryCount++
      return {
        time: this.time,
        retryCount: this.retryCount,
        deferredJobs: this.getDeferredNames()
      }
    }

    this.retryCount = 0

    const selected = this.weightedPick(available)!
    let result: EngineResult = { type: 'FAIL' }

    if (selected.execute) {
      try {
        result = await selected.execute(this.stack)
      } catch {
        result = { type: 'FAIL' }
      }
    }

    if (selected.onUse) {
      try {
        selected.onUse(this.stack)
      } catch (_err) {
        // Ignore
      }
    }

    if (result.type === 'DEFER') {
      selected.cooldownUntil = this.time + (selected.cooldown ?? 1)
    } else if (result.type === 'SUCCESS') {
      selected.cooldownUntil = undefined
    }

    return {
      time: this.time,
      selectedAction: selected.name,
      result,
      retryCount: this.retryCount,
      deferredJobs: this.getDeferredNames()
    }
  }

  private getAvailableActions(): Action[] {
    return this.actions.filter(a => {
      const notInCooldown = !a.cooldownUntil || a.cooldownUntil <= this.time

      let whenOk = true
      if (typeof a.WHEN === 'function') {
        whenOk = a.WHEN({}, this.stack) // ctx vide si tu n’as pas besoin d’un vrai ctx
      } else if (typeof a.WHEN === 'string') {
        // Optionnel : tu peux ajouter un eval ici si tu veux supporter string
        whenOk = true
      }

      return notInCooldown && whenOk
    })
  }

  private getDeferredNames(): string[] {
    return this.actions.filter(a => a.cooldownUntil && a.cooldownUntil > this.time).map(a => a.name)
  }

  private weightedPick(actions: Action[]): Action {
    const totalWeight = actions.reduce((sum, a) => sum + (a.weight ?? 1), 0)
    const r = Math.random() * totalWeight
    let acc = 0
    for (const a of actions) {
      acc += a.weight ?? 1
      if (r <= acc) return a
    }
    return actions[actions.length - 1]
  }
}

// Engine.ts
import type { Action } from './stores/types'

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
      } catch (err) {
        //
      } // on ignore les erreurs d'exécution de onUse
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
      const whenOk =
        !a.WHEN || (typeof a.WHEN === 'function' ? a.WHEN({ stack: this.stack }, this.stack) : true)
      return notInCooldown && whenOk
    })
  }

  private getDeferredNames(): string[] {
    return this.actions.filter(a => a.cooldownUntil && a.cooldownUntil > this.time).map(a => a.name)
  }

  // ===============================
  // WEIGHTED PICK AMÉLIORÉ
  // ===============================
  private weightedPick(actions: Action[]): Action {
    // Crée un tableau de candidats avec score pondéré par cooldown et poids
    const candidates = actions
      .map(a => {
        const weight = a.weight ?? 1
        const cooldownFactor = a.cooldownUntil && a.cooldownUntil > this.time ? 0 : 1
        return { action: a, score: weight * cooldownFactor }
      })
      .filter(c => c.score > 0)

    if (candidates.length === 0) return actions[actions.length - 1]

    const totalScore = candidates.reduce((sum, c) => sum + c.score, 0)
    let r = Math.random() * totalScore
    let acc = 0
    for (const c of candidates) {
      acc += c.score
      if (r <= acc) return c.action
    }
    return candidates[candidates.length - 1].action
  }
}

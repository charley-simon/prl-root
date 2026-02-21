// Engine.ts
import type { Action, Frame } from './stores/types'

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
  deferredJobs: Action[]
}

type EngineConfig = {
  actions: Action[]
  stack?: Frame[]
}

export class Engine {
  private actions: Action[]
  private stack: Frame[]
  private time = 0
  private retryCount = 0

  constructor(config: EngineConfig) {
    this.actions = config.actions
    this.stack = config.stack ?? []
  }

  getStack(): Frame[] {
    return this.stack
  }

  async run(steps: number): Promise<EngineStepResult[]> {
    const results: EngineStepResult[] = []
    for (let i = 0; i < steps; i++) {
      results.push(await this.step())
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
        deferredJobs: this.getDeferredActions()
      }
    }

    this.retryCount = 0

    const selected = this.weightedPick(available)
    if (!selected) {
      return {
        time: this.time,
        retryCount: this.retryCount,
        deferredJobs: this.getDeferredActions()
      }
    }

    let result: EngineResult = { type: 'FAIL' }

    // ✅ Exécution sécurisée
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
      } catch {
        //
      }
    }

    // ⚡ Gestion du cooldown pour DEFER et succès
    if (result.type === 'DEFER') {
      // On ajoute le cooldown pour bloquer la sélection jusqu’au temps futur
      selected.cooldownUntil = this.time + (selected.cooldown ?? 1)
    } else {
      // SUCCESS ou FAIL : on libère le cooldown
      selected.cooldownUntil = undefined
    }

    return {
      time: this.time,
      selectedAction: selected.name,
      result,
      retryCount: this.retryCount,
      deferredJobs: this.getDeferredActions()
    }
  }

  private getAvailableActions(): Action[] {
    // ⚡ ctx: mapping entity => Frame
    const ctx: Record<string, Frame> = Object.fromEntries(this.stack.map(f => [f.entity, f]))

    return this.actions.filter(a => {
      const notInCooldown = !a.cooldownUntil || a.cooldownUntil <= this.time

      const whenOk = !a.WHEN || (typeof a.WHEN === 'function' ? a.WHEN(ctx, this.stack) : true) // si WHEN est une string, tu peux l’évaluer ailleurs si besoin

      return notInCooldown && whenOk
    })
  }

  private getDeferredActions(): Action[] {
    // Renvoie uniquement les actions en cooldown, donc DEFER + cooldown
    return this.actions.filter(a => a.cooldownUntil && a.cooldownUntil > this.time)
  }

  private weightedPick(actions: Action[]): Action | null {
    if (actions.length === 0) return null
    const totalWeight = actions.reduce((sum, a) => sum + (a.weight ?? 1), 0)
    let r = Math.random() * totalWeight
    for (const a of actions) {
      r -= a.weight ?? 1
      if (r <= 0) return a
    }
    return actions[actions.length - 1]
  }
}

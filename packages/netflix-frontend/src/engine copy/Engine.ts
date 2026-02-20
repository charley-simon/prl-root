// engine/Engine.ts
import { StackStore } from './stores/stackStore'
import { Resolver } from './resolver/resolveContext'
import type { Frame, Graph, Action, EngineStepResult } from './stores/types'

export interface EngineAction {
  name: string
  execute?: (
    stack: Frame[]
  ) =>
    | { type: 'SUCCESS' | 'FAIL' | 'DEFER'; [key: string]: any }
    | Promise<{ type: 'SUCCESS' | 'FAIL' | 'DEFER'; [key: string]: any }>
  WHEN?: (ctx: Record<string, Frame>, stack: Frame[]) => boolean
  executed?: boolean
  retryCount?: number
  cooldown?: number
  cooldownUntil?: number
  weight?: number
  onUse?: (result: any) => void
  inputs?: string[]
  contextRequired?: string[]
}

export interface EngineOptions {
  context: Frame[]
  graph: Graph
  actions: EngineAction[]
  maxRetry?: number
}

export class Engine {
  private stackStore: StackStore
  private resolver: Resolver
  private graph: Graph
  private actions: EngineAction[]
  private maxRetry: number
  private deferredJobs: EngineAction[] = []
  private time: number = 0

  constructor({ context, graph, actions, maxRetry = 3 }: EngineOptions) {
    this.stackStore = new StackStore(context)
    this.graph = graph
    this.actions = actions.map(a => ({
      ...a,
      executed: false,
      retryCount: 0
    }))
    this.resolver = new Resolver(this.stackStore, this.graph.relations)
    this.maxRetry = maxRetry
  }

  async step(): Promise<EngineStepResult> {
    this.resolver.resolveContext()

    const ctx = this.stackStore.getContext()
    const stack = this.stackStore.getFrames()

    const availableActions = this.actions.filter(a => {
      const whenOk = !a.WHEN || a.WHEN(ctx, stack)
      const cooldownOk = !a.cooldownUntil || this.time >= a.cooldownUntil
      return !a.executed && whenOk && cooldownOk
    })

    if (availableActions.length === 0) {
      this.time++
      return {
        time: this.time,
        state: 'RETRY_LATER',
        retryCount: 0,
        deferredJobs: [...this.deferredJobs],
        executedAction: null
      }
    }

    const selected = availableActions.sort((a, b) => (b.weight || 0) - (a.weight || 0))[0]

    let result: { type: 'SUCCESS' | 'FAIL' | 'DEFER'; [key: string]: any }
    try {
      result = await (typeof selected.execute === 'function'
        ? selected.execute(this.stackStore.getFrames()) // <-- on passe la stack
        : { type: 'SUCCESS' })
    } catch (e) {
      console.error(`[Engine] action ${selected.name} failed`, e)
      result = { type: 'FAIL', reason: 'EXCEPTION' }
    }

    if (result.type === 'FAIL') {
      selected.retryCount! += 1
      if (selected.retryCount! <= this.maxRetry) {
        selected.cooldownUntil = this.time + (selected.cooldown || 1)
        this.deferredJobs.push(selected)
      } else {
        selected.executed = true
      }
    } else if (result.type === 'DEFER') {
      selected.cooldownUntil = this.time + (selected.cooldown || 1)
      this.deferredJobs.push(selected)
    } else {
      selected.executed = true
      if (selected.onUse) selected.onUse(result)
    }

    // après SUCCESS, DEFER etc.
    if (result.type === 'SUCCESS' && typeof selected.onUse === 'function') {
      selected.onUse(this.stackStore.getFrames()) // <-- idem, on passe stack
    }

    this.time++

    return {
      time: this.time,
      state: result.type === 'FAIL' || result.type === 'DEFER' ? 'RETRY_LATER' : 'RESOLVED',
      retryCount: selected.retryCount || 0,
      deferredJobs: [...this.deferredJobs],
      executedAction: selected.name
    }
  }

  async run(maxSteps = 50): Promise<EngineStepResult[]> {
    const steps: EngineStepResult[] = []

    for (let i = 0; i < maxSteps; i++) {
      const stepRes = await this.step()
      steps.push(stepRes)

      const unfinished = this.stackStore.getFrames().some(f => f.state !== 'RESOLVED')
      if (!unfinished && this.deferredJobs.length === 0) break

      // 🔹 stop immediately si aucune action n’est disponible
      if (stepRes.state === 'RETRY_LATER' && stepRes.deferredJobs.length === 0) break
    }

    return steps
  }
}

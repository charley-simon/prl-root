// src/core/Scheduler.ts

import type { ActionDefinition, Frame, Graph, EngineResult, ActionState } from '../types'
import { Logger } from '../utils/Logger'

export type SchedulerStepResult = {
  selectedAction: string
  result: EngineResult
  updatedStack?: Frame[]
}

export class Scheduler {
  private logger = new Logger()
  private actionStates: Map<string, ActionState>

  constructor(
    private actions: ActionDefinition[],
    private graph: Graph
  ) {
    this.actionStates = new Map(actions.map(a => [a.name, { cooldownUntil: 0, executionCount: 0 }]))
  }

  async step(time: number, stack: Frame[]): Promise<SchedulerStepResult | null> {
    const available = this.getAvailableActions(time, stack)

    if (available.length === 0) {
      return null
    }

    // Select highest weight
    const selected = available.reduce((best, action) =>
      action.weight > best.weight ? action : best
    )

    this.logger.info(`[Scheduler] Executing action: ${selected.name}`)

    // Execute action
    let result: EngineResult
    let executionResult: Frame[] = []

    try {
      executionResult = await selected.execute(stack, this.graph)
      result = {
        type: 'SUCCESS',
        data: executionResult
      }
    } catch (err) {
      result = {
        type: 'FAIL',
        reason: err instanceof Error ? err.message : String(err)
      }
      this.logger.error(`[Scheduler] Action failed: ${selected.name}`, err)
    }

    // Callback
    if (selected.onUse) {
      try {
        selected.onUse(stack, result)
      } catch (err) {
        this.logger.warn(`[Scheduler] onUse callback error`, err)
      }
    }

    // Update state
    this.updateActionState(selected.name, result, selected.cooldown ?? 0, time)

    return {
      selectedAction: selected.name,
      result,
      updatedStack: result.type === 'SUCCESS' ? executionResult : stack
    }
  }

  public getAvailableActions(time: number, stack: Frame[]): ActionDefinition[] {
    return this.actions.filter(action => {
      const state = this.actionStates.get(action.name)!

      // Skip if already executed AND terminal
      if (state.executed && action.terminal) {
        return false
      }

      // Check cooldown
      if (state.cooldownUntil > time) {
        return false
      }

      // Check max executions
      if (action.maxExecutions !== undefined && state.executionCount >= action.maxExecutions) {
        return false
      }

      // Check condition
      if (!action.when) {
        return true // No condition = always available
      }

      try {
        return action.when(stack)
      } catch {
        return false
      }
    })
  }

  private updateActionState(
    name: string,
    result: EngineResult,
    cooldown: number,
    time: number
  ): void {
    const current = this.actionStates.get(name)!
    const action = this.actions.find(a => a.name === name)!

    this.actionStates.set(name, {
      cooldownUntil: result.type === 'DEFER' ? time + cooldown : 0,
      executionCount: current.executionCount + 1,
      lastResult: result,
      executed: action.terminal ? true : current.executed
    })
  }

  public getActionState(name: string): ActionState | undefined {
    return this.actionStates.get(name)
  }

  public getStack(): Frame[] {
    return []
  }
}

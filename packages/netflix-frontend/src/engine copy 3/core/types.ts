// types.ts (SEULE source de vérité)

// ==================== FRAME ====================
export type Frame = {
  entity: string
  id: number
  state: string
  purpose?: string
  intent?: Record<string, any>
}

// ==================== ACTION CONFIG ====================
export type ActionDefinition = {
  readonly name: string
  readonly weight: number // Pas d'optionnel, défaut 1
  readonly when: WhenPredicate
  readonly execute: ExecuteFunction
  readonly onUse?: OnUseHook
  readonly cooldown: number // Pas d'optionnel, défaut 0
}

// Types helpers
export type WhenPredicate = (stack: Frame[]) => boolean
export type ExecuteFunction = (stack: Frame[]) => EngineResult | Promise<EngineResult>
export type OnUseHook = (stack: Frame[], result: EngineResult) => void

// ==================== RESULT ====================
export type EngineResultType = 'SUCCESS' | 'FAIL' | 'DEFER'

export type EngineResult = {
  readonly type: EngineResultType
  readonly reason?: string
  readonly data?: unknown
}

// ==================== ENGINE STATE ====================
export type EngineState = {
  readonly time: number
  readonly stack: Frame[]
  readonly actionStates: Map<string, ActionState> // name → state
}

export type ActionState = {
  readonly cooldownUntil: number // 0 = pas de cooldown
  readonly executionCount: number
  readonly lastResult?: EngineResult
}

// ==================== STEP RESULT ====================
export type EngineStepResult = {
  readonly time: number
  readonly selectedAction?: string
  readonly result?: EngineResult
  readonly availableCount: number
  readonly deferredCount: number
}

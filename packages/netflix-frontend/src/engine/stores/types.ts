// engine/stores/types.ts

export interface Frame {
  entity: string
  id: number
  state: string
  purpose?: string
  intent?: Record<string, any>
}

export type EngineResult = {
  type: 'SUCCESS' | 'FAIL' | 'DEFER'
  reason?: string
  [key: string]: any
}

export interface Action {
  name: string
  weight?: number

  // Support string (JSON) ou fonction (runtime)
  WHEN?: string | ((ctx: Record<string, Frame>, stack: Frame[]) => boolean)

  // Support sync + async
  execute?: (stack: Frame[]) => EngineResult | Promise<EngineResult>

  onUse?: (stack: Frame[]) => void

  cooldown?: number

  // Champs runtime gérés par l’engine
  executed?: boolean
  retryCount?: number
  cooldownUntil?: number
}

export interface EngineStepResult {
  time: number
  retryCount: number
  deferredJobs: Action[]
  executedAction?: string
}

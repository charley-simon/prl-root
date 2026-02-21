// engine/cli/engine-cli-advanced.ts
import fs from 'fs'
import path from 'path'
import { Engine } from '../Engine'
import type { Frame, Action } from '../stores/types'

type Scenario = 'api_succes' | 'api_fail' | 'scenario1'

// ---------------- HELPER POUR EVAL ----------------
function evalCondition(code: string, context: any) {
  try {
    return Function(...Object.keys(context), `return (${code})`)(...Object.values(context))
  } catch {
    return false
  }
}

function evalExecute(code: string, context: any) {
  try {
    return Function(...Object.keys(context), code)(...Object.values(context))
  } catch {
    return { type: 'FAIL' }
  }
}

// ---------------- RUN SCENARIO ----------------
async function runScenario(scenario: Scenario) {
  const scenarioPath = path.resolve(__dirname, '../scenarios', scenario)

  const loadJson = (filename: string) =>
    JSON.parse(fs.readFileSync(path.join(scenarioPath, filename), 'utf-8'))

  const context: Frame[] = loadJson('context.json')
  const actionsRaw: any[] = loadJson('actions.json')

  // Transforme les actions JSON en EngineAction
  const wrappedActions: Action[] = actionsRaw.map(a => ({
    ...a,
    WHEN: a.WHEN
      ? (ctx: Record<string, Frame>, stack: Frame[]) => evalCondition(a.WHEN, { ctx, stack })
      : undefined,
    execute: a.execute ? (stack: Frame[]) => evalExecute(a.execute, { stack }) : undefined,
    onUse: a.onUse ? (stack: Frame[]) => evalExecute(a.onUse, { stack }) : undefined,
    executed: false,
    retryCount: 0,
    cooldown: a.cooldown ?? 1
  }))

  // Crée l’engine avec le stack initial
  const engine = new Engine({ actions: wrappedActions, stack: context })

  console.log('===================================')
  console.log(`SCENARIO: ${scenario}`)
  console.log('===================================')

  const steps = await engine.run(15)

  steps.forEach((step, idx) => {
    console.log('\n-----------------------------------')
    console.log(`STEP ${idx + 1}`)
    console.log('-----------------------------------')
    console.log(`TIME: ${step.time}`)
    console.log(`RETRY COUNT: ${step.retryCount}`)

    // Actions en cooldown / différées
    if (step.deferredJobs && step.deferredJobs.length > 0) {
      const deferredStatus = step.deferredJobs.map((action: Action) => {
        const remaining = action.cooldownUntil ? action.cooldownUntil - step.time : 0
        return `${action.name} (cooldown: ${remaining})`
      })

      console.log(`DEFERRED JOBS: ${deferredStatus.join(', ')}`)
    } else {
      console.log('DEFERRED JOBS: none')
    }

    console.log('STACK:', JSON.stringify(engine.getStack(), null, 2))
    console.log(step.selectedAction ? `→ SELECTED: ${step.selectedAction}` : 'NO ACTION AVAILABLE')
    console.log('RESULT:', step.result ? step.result.type : 'N/A')
  })

  console.log('\n=========== END ===========')
}

// ---------------- CLI ----------------
const scenarioArg = process.argv[2] as Scenario

if (!scenarioArg) {
  console.log('Usage: ts-node cli/engine-cli-advanced.ts api_succes|api_fail|scenario1')
  process.exit(1)
}

runScenario(scenarioArg)

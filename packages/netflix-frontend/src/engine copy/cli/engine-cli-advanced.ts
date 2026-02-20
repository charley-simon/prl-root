// engine/cli/engine-cli-advanced.ts
import fs from 'fs'
import path from 'path'
import { Engine } from '../Engine'
import type { Frame, EngineAction, EngineStepResult } from '../stores/types'

type Scenario = 'api_succes' | 'api_fail' | 'scenario1'

// ---------------- HELPER POUR EVAL ----------------
function evalWithContext(code: string, context: Record<string, any>): any {
  return Function(...Object.keys(context), code)(...Object.values(context))
}

// ---------------- RUN SCENARIO ----------------
async function runScenario(scenario: Scenario) {
  const scenarioPath = path.resolve(__dirname, '../scenarios', scenario)

  const loadJson = (filename: string) =>
    JSON.parse(fs.readFileSync(path.join(scenarioPath, filename), 'utf-8'))

  const context: Frame[] = loadJson('context.json')
  const actionsRaw: any[] = loadJson('actions.json')
  const graph = loadJson('graph.json')

  // Transforme les actions JSON en EngineAction
  const wrappedActions: EngineAction[] = actionsRaw.map(a => ({
    ...a,
    WHEN: a.WHEN
      ? (ctx: Record<string, Frame>, stack: Frame[]) => evalWithContext(a.WHEN, { ctx, stack })
      : undefined,
    execute: a.execute ? (stack: Frame[]) => evalWithContext(a.execute, { stack }) : undefined,
    onUse: a.onUse ? () => evalWithContext(a.onUse, {}) : undefined,
    executed: false,
    retryCount: 0
  }))

  const engine = new Engine({ context, graph, actions: wrappedActions })

  console.log('===================================')
  console.log(`SCENARIO: ${scenario}`)
  console.log('===================================')

  const steps: EngineStepResult[] = await engine.run(50)

  steps.forEach((step, idx) => {
    console.log('\n-----------------------------------')
    console.log(`STEP ${idx + 1}`)
    console.log('-----------------------------------')
    console.log(`TIME: ${step.time}`)
    console.log(`RETRY COUNT: ${step.retryCount}`)

    // Affiche les actions DEFER avec cooldown restant
    if (step.deferredJobs.length > 0) {
      const deferredStatus = step.deferredJobs.map(d => {
        const remaining = d.cooldownUntil ? d.cooldownUntil - step.time : 0
        return `${d.name} (cooldown: ${remaining})`
      })
      console.log(`DEFERRED JOBS: ${deferredStatus.join(', ')}`)
    } else {
      console.log(`DEFERRED JOBS: none`)
    }

    console.log('STACK:', JSON.stringify(engine['stackStore'].getFrames(), null, 2))
    console.log(step.executedAction ? `→ SELECTED: ${step.executedAction}` : 'NO ACTION AVAILABLE')
    console.log('RESULT:', step.executedAction ? 'SUCCESS / FAIL / DEFER handled' : 'N/A')
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

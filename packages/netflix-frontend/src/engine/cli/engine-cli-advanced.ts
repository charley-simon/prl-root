// engine/cli/engine-cli-advanced.ts
import fs from 'fs'
import path from 'path'
import { Engine, EngineAction, EngineStepResult } from '../Engine'
import type { Frame } from '../stores/types'

type Scenario = 'api_succes' | 'api_fail' | 'scenario1'

// ---------------- HELPER POUR EVAL ----------------
function evalWithContext(code: string, context: Record<string, any>) {
  // Crée une vraie fonction avec body complet, pas seulement un return
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

  // ---------------- Wrap actions JSON en EngineAction ----------------
  const wrappedActions: EngineAction[] = actionsRaw.map(a => ({
    ...a,
    WHEN: a.WHEN
      ? (ctx: any, stack: any[]) => evalWithContext(`return (${a.WHEN})`, { ctx, stack })
      : undefined,
    execute: a.execute ? (stack: any[]) => evalWithContext(a.execute, { stack }) : undefined,
    onUse: a.onUse ? (stack: any[]) => evalWithContext(a.onUse, { stack }) : undefined,
    executed: false,
    retryCount: 0
  }))

  // ---------------- Création du moteur ----------------
  const engine = new Engine({ context, graph, actions: wrappedActions })

  console.log('===================================')
  console.log(`SCENARIO: ${scenario}`)
  console.log('===================================')

  const steps: EngineStepResult[] = await engine.run(10)

  steps.forEach((step: EngineStepResult) => {
    console.log('\n-----------------------------------')
    console.log(`STEP ${step.time}`)
    console.log('-----------------------------------')
    console.log(`TIME: ${step.time}`)
    console.log(`RETRY COUNT: ${step.retryCount}`)
    console.log(
      `DEFERRED JOBS: ${
        step.deferredJobs.length > 0 ? step.deferredJobs.map(d => d.name).join(', ') : 'none'
      }`
    )
    console.log('STACK:', JSON.stringify(engine['stackStore'].getFrames(), null, 2))
    console.log(step.executedAction ? `→ SELECTED: ${step.executedAction}` : 'NO ACTION AVAILABLE')
    console.log('RESULT:', step.executedAction ? 'SUCCESS / FAIL handled' : 'N/A')
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

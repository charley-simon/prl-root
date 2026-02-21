// cli/engine-cli-advanced.ts

import fs from 'fs'
import path from 'path'
import { Engine } from '../core/Engine'
import type { Frame, ActionDefinition } from '../types'

// ==================== ACTION BUILDERS ====================

// Au lieu d'eval(), on construit les fonctions explicitement
const actionBuilders = {
  fetchMovie: (): ActionDefinition => ({
    name: 'fetchMovie',
    weight: 10,
    when: stack => stack[0]?.state === 'UNKNOWN',
    execute: stack => {
      stack[0].state = 'AVAILABLE'
      return { type: 'SUCCESS' }
    },
    onUse: () => console.log('fetchMovie executed'),
    cooldown: 0
  }),

  proposeSimilar: (): ActionDefinition => ({
    name: 'proposeSimilar',
    weight: 20,
    when: stack => stack[0]?.state === 'AVAILABLE',
    execute: () => {
      console.log('proposeSimilar executed')
      return { type: 'DEFER' }
    },
    onUse: () => console.log('onUse proposeSimilar'),
    cooldown: 2
  }),

  logPeople: (): ActionDefinition => ({
    name: 'logPeople',
    weight: 5,
    when: stack => stack[1]?.state === 'UNKNOWN',
    execute: stack => {
      stack[1].state = 'VIEWED'
      return { type: 'SUCCESS' }
    },
    onUse: () => console.log('logPeople executed'),
    cooldown: 0
  })
}

// ==================== SCENARIO RUNNER ====================

async function runScenario(scenarioName: string) {
  const scenarioPath = path.resolve(__dirname, '../scenarios', scenarioName)

  const context: Frame[] = JSON.parse(
    fs.readFileSync(path.join(scenarioPath, 'context.json'), 'utf-8')
  )

  const actionsConfig: any[] = JSON.parse(
    fs.readFileSync(path.join(scenarioPath, 'actions.json'), 'utf-8')
  )

  // Build actions from config
  const actions: ActionDefinition[] = actionsConfig.map(cfg => {
    const builder = actionBuilders[cfg.name as keyof typeof actionBuilders]
    if (!builder) {
      throw new Error(`Unknown action: ${cfg.name}`)
    }
    return builder()
  })

  const engine = new Engine({
    actions,
    initialStack: context
  })

  console.log(`\n${'='.repeat(50)}`)
  console.log(`SCENARIO: ${scenarioName}`)
  console.log('='.repeat(50))

  const steps = await engine.run(15)

  steps.forEach((step, idx) => {
    console.log(`\n--- STEP ${idx + 1} (time=${step.time}) ---`)
    console.log(`Available: ${step.availableCount}, Deferred: ${step.deferredCount}`)

    if (step.selectedAction) {
      console.log(`→ ${step.selectedAction}: ${step.result?.type}`)
    } else {
      console.log('→ No action available')
    }
  })

  console.log(`\n${'='.repeat(50)}\n`)
}

// ==================== CLI ====================
const scenarioArg = process.argv[2]
if (!scenarioArg) {
  console.error('Usage: ts-node cli.ts <scenario>')
  process.exit(1)
}

runScenario(scenarioArg)

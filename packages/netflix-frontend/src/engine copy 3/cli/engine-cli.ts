// engine-cli.ts (nouveau)
import { Engine } from '../core/Engine'
import fs from 'fs'
import path from 'path'

const scenarioName = process.argv[2]

if (!scenarioName) {
  console.log('Usage: ts-node engine-cli.ts <scenario-folder>')
  process.exit(1)
}

// Chargement des fichiers du scénario
const scenarioPath = path.resolve(__dirname, 'scenarios', scenarioName)
const loadJson = (filename: string) =>
  JSON.parse(fs.readFileSync(path.join(scenarioPath, filename), 'utf-8'))

const context = loadJson('context.json').stack
const actions = loadJson('actions.json')
const graph = loadJson('graph.json')

async function run() {
  const engine = new Engine({ context, actions, graph })
  const steps = await engine.run()

  for (const step of steps) {
    console.log('\n-----------------------------------')
    console.log(`STEP ${step.time}`)
    console.log('-----------------------------------')
    console.log(`STATE: ${step.state}`)
    console.log(`RETRY COUNT: ${step.retryCount}`)
    console.log(`DEFERRED JOBS: ${step.deferredJobs.map(j => j.name).join(', ') || 'none'}`)
    console.log(`EXECUTED ACTION: ${step.executedAction || 'none'}`)
  }

  console.log('\n=========== END ===========')
}

run()

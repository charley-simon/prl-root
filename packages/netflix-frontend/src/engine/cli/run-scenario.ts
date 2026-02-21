// cli/run-scenario.ts

import fs from 'fs'
import path from 'path'
import { Engine } from '../../../../linklab/src/core/Engine'
import type { Graph, Frame, ActionDefinition, EngineMode } from '../../../../linklab/src'
import { MetroFormatter } from '../formatters/MetroFormatter'
import type { PathFormatter } from '../formatters/BaseFormatter'

// ==================== HELPERS ====================

function loadGraph(scenarioPath: string): Graph {
  return JSON.parse(fs.readFileSync(path.join(scenarioPath, 'graph.json'), 'utf-8'))
}

function loadStack(scenarioPath: string): Frame[] {
  return JSON.parse(fs.readFileSync(path.join(scenarioPath, 'stack.json'), 'utf-8'))
}

async function loadActions(scenarioPath: string): Promise<ActionDefinition[]> {
  const actionsPath = path.join(scenarioPath, 'actions.ts')

  if (!fs.existsSync(actionsPath)) {
    return []
  }

  const fileUrl = `file:///${actionsPath.replace(/\\/g, '/')}`
  const actionsModule = await import(fileUrl)
  return actionsModule.default || []
}

function getFormatter(scenarioPath: string): PathFormatter | null {
  const scenarioName = path.basename(scenarioPath)

  switch (scenarioName) {
    case 'test-metro-paris':
      return new MetroFormatter()

    // Futurs formatters
    // case 'test-netflix':
    //   return new NetflixFormatter()

    // case 'test-musicians':
    //   return new MusiciansFormatter()

    default:
      return null // Pas de formatter = affichage générique
  }
}

// ==================== SCENARIO RUNNER ====================

async function runScenario(scenarioPath: string) {
  const configPath = path.join(scenarioPath, 'config.json')
  const config = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    : { mode: 'SCHEDULE' }

  const mode: EngineMode = config.mode || 'SCHEDULE'
  const graph = loadGraph(scenarioPath)
  const stack = loadStack(scenarioPath)
  const actions = mode === 'SCHEDULE' ? await loadActions(scenarioPath) : []

  // Afficher les actions chargées
  if (mode === 'SCHEDULE') {
    console.log(`\n📋 Actions chargées : ${actions.length}`)
    actions.forEach(a => {
      console.log(`  - ${a.name} (weight: ${a.weight})`)
    })
  }

  const engine = new Engine({
    mode,
    graph,
    initialStack: stack,
    actions: mode === 'SCHEDULE' ? actions : undefined,
    pathQuery: mode === 'PATHFIND' ? config.pathQuery : undefined
  })

  console.log(`\n${'='.repeat(60)}`)
  console.log(`SCENARIO: ${path.basename(scenarioPath)}`)
  console.log(`MODE: ${mode}`)

  // ✅ NOUVEAU : Afficher l'objectif selon le mode
  if (mode === 'PATHFIND' && config.pathQuery) {
    const formatter = getFormatter(scenarioPath)
    const from = formatter ? cleanStationName(config.pathQuery.from) : config.pathQuery.from
    const to = formatter ? cleanStationName(config.pathQuery.to) : config.pathQuery.to

    console.log(`OBJECTIF: ${from} → ${to}`)
  } else if (mode === 'SCHEDULE') {
    console.log(`OBJECTIF: Exécuter les actions sur le contexte initial`)
  } else if (mode === 'NAVIGATE') {
    console.log(`OBJECTIF: Résoudre les frames du contexte`)
  }

  console.log('='.repeat(60))

  const results = await engine.run(20)

  // Utiliser un formatter si disponible pour PATHFIND
  if (mode === 'PATHFIND' && results[0]?.path) {
    const formatter = getFormatter(scenarioPath)

    if (formatter) {
      console.log(formatter.format(results[0].path))
    } else {
      // Fallback : affichage générique
      console.log(`\nSTEP 1 (t=0) [PATHFIND/]`)
      console.log(
        `  Path: ${results[0].path.nodes.join(' → ')} (weight: ${results[0].path.totalWeight})`
      )
    }
  } else {
    // Affichage classique pour SCHEDULE ou NAVIGATE
    results.forEach((step, i) => {
      console.log(`\nSTEP ${i + 1} (t=${step.time}) [${step.mode}/${step.phase || ''}]`)

      if (step.selectedAction) {
        console.log(`  Action: ${step.selectedAction} → ${step.result?.type}`)
      }

      if (step.resolvedCount !== undefined) {
        console.log(`  Resolved: ${step.resolvedCount}, Unresolved: ${step.unresolvedCount}`)
      }

      if (step.path) {
        console.log(`  Path: ${step.path.nodes.join(' → ')} (weight: ${step.path.totalWeight})`)
      }
    })
  }

  // Compare avec expected.json
  const expectedPath = path.join(scenarioPath, 'expected.json')
  if (fs.existsSync(expectedPath)) {
    const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf-8'))
    const match = JSON.stringify(results) === JSON.stringify(expected)
    console.log(`\n${match ? '✅ PASS' : '❌ FAIL'} (vs expected.json)`)
  }

  console.log(`\n${'='.repeat(60)}\n`)
}

// ✅ HELPER : Nettoyer les noms de stations (réutilisable)
function cleanStationName(name: string): string {
  return name
    .replace('Station-', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ==================== CLI ====================

const scenarioPath = process.argv[2]
if (!scenarioPath) {
  console.error('Usage: tsx cli/run-scenario.ts <scenario-path>')
  process.exit(1)
}

runScenario(scenarioPath)

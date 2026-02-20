// scenario1.test.ts
import { describe, it, expect } from 'vitest'
import { Engine } from '../Engine'
import fs from 'fs'
import path from 'path'

const scenarioPath = path.resolve(__dirname, '../cli/scenarios/scenario1')

const loadJson = (filename: string) =>
  JSON.parse(fs.readFileSync(path.join(scenarioPath, filename), 'utf-8'))

describe('Scenario 1 - Test moteur CLI', () => {
  it('should produce expected results', async () => {
    const context = loadJson('context.json').stack // on prend la stack
    const actions = loadJson('actions.json')
    const graph = loadJson('graph.json')

    const engine = new Engine({ context, actions, graph })
    const result = await engine.run(50)

    const expectedPath = path.join(scenarioPath, 'expected.json')
    if (!fs.existsSync(expectedPath)) {
      console.log('No expected.json found, creating one...')
      fs.writeFileSync(expectedPath, JSON.stringify(result, null, 2))
      console.log('Copy the result to expected.json after verification!')
    } else {
      const expected = loadJson('expected.json')
      expect(result).toEqual(expected)
    }
  })
})

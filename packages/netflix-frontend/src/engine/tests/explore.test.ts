// tests/explore.test.ts

import { Engine } from '../../../../linklab/src/core/Engine'
import type { Graph, Frame } from '../../../../linklab/src'

const graph: Graph = {
  relations: [
    {
      name: 'directors-movies',
      fromEntity: 'Directors',
      toEntity: 'Movies',
      via: 'Movie-People',
      weight: 5
    },
    {
      name: 'movies-actors',
      fromEntity: 'Movies',
      toEntity: 'Actors',
      via: 'Movie-People',
      weight: 3
    },
    {
      name: 'actors-movies',
      fromEntity: 'Actors',
      toEntity: 'Movies',
      via: 'Movie-People',
      weight: 4
    },
    {
      name: 'actors-directors',
      fromEntity: 'Actors',
      toEntity: 'Directors',
      via: 'Movie-People',
      weight: 6
    }
  ]
}

const stack: Frame[] = [
  { entity: 'Directors', id: 2, state: 'RESOLVED' },
  { entity: 'Movies', id: 10, state: 'RESOLVED' },
  { entity: 'Actors', id: 3, state: 'RESOLVED' }
]

const engine = new Engine({
  mode: 'NAVIGATE',
  graph,
  initialStack: stack
})

console.log('\n🔍 EXPLORATION CONTEXTUELLE\n')
console.log('='.repeat(60))

const exploration = engine.explore()

console.log('\n📍 DEPUIS LA POSITION ACTUELLE (Actors)')
console.log('─'.repeat(60))
exploration.availablePaths.forEach(path => {
  console.log(`  → ${path.label} (${path.preview})`)
})

console.log('\n🔗 RELATIONS CROISÉES DANS LE CONTEXTE')
console.log('─'.repeat(60))
exploration.crossRelations.forEach(rel => {
  console.log(`  → ${rel.summary} (weight: ${rel.weight})`)
})

console.log('\n💡 SUGGESTIONS')
console.log('─'.repeat(60))
exploration.suggestions.forEach(sug => {
  console.log(`  ${sug.type}: ${sug.label}`)
})

console.log('\n' + '='.repeat(60) + '\n')

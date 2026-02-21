// tests/contextual-explorer.test.ts

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

const exploration = engine.explore()

console.log('\n=== AVAILABLE PATHS ===')
exploration.availablePaths.forEach(path => {
  console.log(`→ ${path.label} (${path.preview})`)
})

console.log('\n=== CROSS RELATIONS ===')
exploration.crossRelations.forEach(rel => {
  console.log(`→ ${rel.summary}`)
})

console.log('\n=== SUGGESTIONS ===')
exploration.suggestions.forEach(sug => {
  console.log(`💡 ${sug.label}`)
})

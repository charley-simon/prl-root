// scenarios/test-netflix/actions.ts (corrigé)

import type { ActionDefinition, Frame } from '../../../../../linklab/src'

const actions: ActionDefinition[] = [
  {
    name: 'selectMovie',
    weight: 10,
    when: (stack: Frame[]) => {
      const movies = stack.find(f => f.entity === 'Movies')
      // ✅ Movies résolu MAIS pas encore d'ID
      return movies?.state === 'RESOLVED' && !movies.id
    },
    execute: async (stack: Frame[]) => {
      console.log('  🎬 [selectMovie] User selects a movie from list...')

      const movies = stack.find(f => f.entity === 'Movies')
      if (movies) {
        movies.id = 10
        console.log('  ✓ Movie 10 selected')
      }

      return { type: 'SUCCESS' }
    },
    cooldown: 0
  },

  {
    name: 'navigateToActors',
    weight: 8,
    when: (stack: Frame[]) => {
      const movies = stack.find(f => f.entity === 'Movies')
      const actors = stack.find(f => f.entity === 'Actors')

      // ✅ Movie sélectionné ET pas encore de frame Actors
      return !!movies && movies.id != null && !actors
    },
    execute: async (stack: Frame[]) => {
      console.log('  🎭 [navigateToActors] User clicks "View Actors"...')

      stack.push({
        entity: 'Actors',
        state: 'UNRESOLVED'
      })

      console.log('  ✓ Actors frame added to stack')

      return { type: 'SUCCESS' }
    },
    cooldown: 0
  },

  {
    name: 'selectActor',
    weight: 5,
    when: (stack: Frame[]) => {
      const actors = stack.find(f => f.entity === 'Actors')

      // ✅ Actors existe ET résolu ET pas d'ID
      return !!actors && actors.state === 'RESOLVED' && !actors.id
    },
    execute: async (stack: Frame[]) => {
      console.log('  ⭐ [selectActor] User selects an actor from list...')

      const actors = stack.find(f => f.entity === 'Actors')
      if (actors) {
        actors.id = 3
        console.log('  ✓ Actor 3 selected')
      }

      return { type: 'SUCCESS' }
    },
    cooldown: 0
  },

  {
    name: 'exploreFromActor',
    weight: 3,
    terminal: true, // ✅ S'exécute une seule fois
    when: (stack: Frame[]) => {
      const actors = stack.find(f => f.entity === 'Actors')
      return !!actors && actors.id != null
    },
    execute: async (stack: Frame[]) => {
      console.log('  🔍 [exploreFromActor] Showing exploration options...')
      console.log('      - Filmographie')
      console.log('      - Autres réalisateurs')
      console.log('      - Co-stars')

      return { type: 'SUCCESS' }
    },
    cooldown: 0
  }
]

export default actions

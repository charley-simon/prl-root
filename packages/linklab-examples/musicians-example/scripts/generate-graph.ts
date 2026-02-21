// scripts/generate-graph.ts

import { writeFileSync } from 'fs'
import type { Graph, Relation } from 'linklab'

// Import data
import artists from '../data/artists.json'
import tracks from '../data/tracks.json'

/**
 * Generate LinkLab graph from musicians dataset
 *
 * Relations are naturally bidirectional in PathFinder,
 * so we only create forward relations.
 */
function generateGraph(): Graph {
  const relations: Relation[] = []
  let relationCounter = 0

  // 1. Artist → Track (created)
  tracks.forEach(track => {
    relations.push({
      name: `created-${relationCounter++}`,
      fromEntity: `artist-${track.artist}`,
      toEntity: `track-${track.id}`,
      via: 'created',
      weight: 2,
      metadata: {
        type: 'created',
        year: track.year
      }
    })
  })

  // 2. Track → Track (samples)
  tracks.forEach(track => {
    if (track.samples && track.samples.length > 0) {
      track.samples.forEach(sampledTrackId => {
        relations.push({
          name: `sample-${relationCounter++}`,
          fromEntity: `track-${track.id}`,
          toEntity: `track-${sampledTrackId}`,
          via: 'samples',
          weight: 5,
          metadata: {
            type: 'sample',
            sampledYear: tracks.find(t => t.id === sampledTrackId)?.year,
            samplerYear: track.year
          }
        })
      })
    }
  })

  const graph: Graph = {
    relations,
    metadata: {
      source: 'Musicians sampling network',
      date: new Date().toISOString(),
      description: 'Graph showing sampling relationships in music (bidirectional)',
      stats: {
        artists: artists.length,
        tracks: tracks.length,
        relations: relations.length
      }
    }
  }

  return graph
}

// Generate and save
const graph = generateGraph()

// Ensure public/data directory exists
import { mkdirSync } from 'fs'
try {
  mkdirSync('./public/data', { recursive: true })
} catch {}

// Save graph
writeFileSync('./public/data/graph.json', JSON.stringify(graph, null, 2), 'utf-8')

// ✅ Copy source data files to public for web access
writeFileSync('./public/data/artists.json', JSON.stringify(artists, null, 2), 'utf-8')

writeFileSync('./public/data/tracks.json', JSON.stringify(tracks, null, 2), 'utf-8')

console.log('✅ Graph generated successfully!')
console.log(`   - ${graph.metadata?.stats.artists} artists`)
console.log(`   - ${graph.metadata?.stats.tracks} tracks`)
console.log(`   - ${graph.metadata?.stats.relations} relations (bidirectional navigation enabled)`)
console.log('')
console.log('📁 Saved to: public/data/')
console.log('   - graph.json')
console.log('   - artists.json')
console.log('   - tracks.json')

import 'dotenv/config' // charge automatiquement .env à la racine
import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { handleVideoFile } from '../../src/providers/tmdbUtils'
import { metricsRegistry } from '../../src/services/monitoring/metricsRegistry'

const DATA_DIR = path.resolve('./data/movies')

// Mock TMDB si nécessaire pour ne pas taper dans l'API à chaque test
// On pourrait mocker fetch ou injecter un TMDBService factice

describe('UC7 – Identification via TMDB', () => {
  const testFilePath = path.join('./incoming', 'A Star is Born.2018.mkv')

  beforeAll(() => {
    // Créer un fichier dummy pour le test si besoin
    if (!fs.existsSync('./incoming')) fs.mkdirSync('./incoming')
    fs.writeFileSync(testFilePath, Buffer.from('fake-content'))
  })

  beforeEach(() => {
    metricsRegistry.reset()
  })

  it('doit identifier un film et mettre à jour le JSON', async () => {
    const movieId = await handleVideoFile(testFilePath)

    // Vérifier que le JSON correspondant a été créé
    const fileName = path.join(DATA_DIR, `${movieId}-detail.json`)
    console.log(fileName)
    const exist = fs.existsSync(fileName)
    expect(exist).toBeDefined()

    const movieData = JSON.parse(fs.readFileSync(fileName, 'utf-8'))

    expect(movieData).toHaveProperty('id')
    expect(movieData).toHaveProperty('title')
    expect(movieData).toHaveProperty('releaseYear')
    expect(movieData.video.localPath).toContain('A Star is Born.2018.mkv')

    // On pourrait aussi tester les images AVIF si nécessaire
    expect(movieData.posterPath || movieData.video).toBeDefined()

    // ✅ métriques
    expect(metricsRegistry.getCounter('worker.tmdb.identification.success_total')).toBe(1)

    expect(
      metricsRegistry.getHistogram('worker.tmdb.identification.confidence')[0]
    ).toBeGreaterThan(0)

    expect(metricsRegistry.getTimer('worker.tmdb.identification.duration_ms')[0]).toBeGreaterThan(0)

    console.log(metricsRegistry)
  })
})

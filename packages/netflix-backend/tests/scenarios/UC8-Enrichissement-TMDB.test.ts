import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { MovieServiceImpl } from '../../src/services/movie/movieService'
import { tmdbWorker } from '../../src/providers/tmdbUtils'

const DATA_DIR = path.resolve('./data/movies')

describe('UC8 – Enrichissement TMDB', () => {
  const movieService = new MovieServiceImpl()
  let movieId: number

  beforeAll(async () => {
    // Choisir un film existant pour test
    const movies = await movieService.listMovies({ offset: 0, limit: 10 })
    movieId = movies[0].id

    // Nettoyer les champs pour tester l'enrichissement
    const moviePath = path.join(DATA_DIR, `${movieId}-movie.json`)
    const movieData = JSON.parse(fs.readFileSync(moviePath, 'utf-8'))
    delete movieData.tmdbId
    delete movieData.synopsis
    delete movieData.wikiDescription
    fs.writeFileSync(moviePath, JSON.stringify(movieData, null, 2), 'utf-8')
  })

  it('doit enrichir un film via TMDB', async () => {
    const movieBefore = await movieService.getMovieDetailById(movieId)
    expect(movieBefore.tmdbId).toBeUndefined()

    // Appeler l’enrichissement TMDB
    await tmdbWorker.enrichMovie(movieBefore)

    // Recharger le fichier
    const moviePath = path.join(DATA_DIR, `${movieId}-movie.json`)
    const movieAfter = JSON.parse(fs.readFileSync(moviePath, 'utf-8'))

    expect(movieAfter.tmdbId).toBeDefined()
    expect(movieAfter.synopsis).toBeDefined()
    expect(movieAfter.synopsis.length).toBeGreaterThan(0)
    console.log(`UC8 - Enrichissement TMDB: movie.tmdbId=${movieAfter.tmdbId}`)
  })

  it('doit être idempotent', async () => {
    const movieBefore = await movieService.getMovieDetailById(movieId)
    const result1 = await tmdbWorker.enrichMovie(movieBefore)
    const result2 = await tmdbWorker.enrichMovie(movieBefore)

    expect(result1.tmdbId).toBe(result2.tmdbId)
    expect(result1.synopsis).toBe(result2.synopsis)
  })
})

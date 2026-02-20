import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs'
import path from 'path'
import { MovieServiceImpl } from '../../src/services/movie/movieService'
import { TmdbFileMovieProvider } from '../../src/providers/tmdb/TmdbFileMovieProvider'
import { IEntityProvider } from '../../src/providers/EntityProvider'

const DATA_DIR = path.resolve('./data/tmdb/movies')

describe('UC8 – Enrichissement TMDB', () => {
  let tmdbWorker: TmdbFileMovieProvider
  const movieService = new MovieServiceImpl()
  let movieId: number

  beforeAll(async () => {
    tmdbWorker = new TmdbFileMovieProvider(DATA_DIR)
    // Choisir un film existant pour test
    const movies = await movieService.listMovies({ offset: 0, limit: 10 })
    movieId = 550

    // Nettoyer les champs pour tester l'enrichissement
    const moviePath = path.join(DATA_DIR, `${movieId}-Movie-Details.json`)
    const movieData = JSON.parse(fs.readFileSync(moviePath, 'utf-8'))
    delete movieData.tmdbId
    delete movieData.synopsis
    delete movieData.wikiDescription
    fs.writeFileSync(moviePath, JSON.stringify(movieData, null, 2), 'utf-8')
  })

  it('doit enrichir un film via TMDB', async () => {
    const movieBefore = await movieService.getMovieDetailById(movieId)
    expect(movieBefore).toBeDefined()
    expect(movieBefore.title).toBeDefined()

    // Appeler l’enrichissement TMDB
    await tmdbWorker.enrich(movieBefore)
    expect(movieBefore.externalsIds).toBeDefined()
    expect(movieBefore.externalsIds?.tmdb).toBeDefined()

    // Recharger le fichier
    const moviePath = path.join(DATA_DIR, `${movieId}-Movie-Details.json`)
    const movieAfter = JSON.parse(fs.readFileSync(moviePath, 'utf-8'))

    expect(movieAfter.externalsIds?.tmdb).toBeDefined()
    expect(movieAfter.synopsis).toBeDefined()
    expect(movieAfter.synopsis.length).toBeGreaterThan(0)
    console.log(`UC8 - Enrichissement TMDB: movie.tmdbId=${movieAfter.externalsIds?.id}`)
  })

  it('doit être idempotent', async () => {
    const movieBefore = await movieService.getMovieDetailById(movieId)
    const result1 = await tmdbWorker.enrich(movieBefore)
    const result2 = await tmdbWorker.enrich(movieBefore)

    expect(result1.externalsIds?.tmdb).toBe(result2.externalsIds?.tmdb)
    expect(result1.synopsis).toBe(result2.synopsis)
  })
})

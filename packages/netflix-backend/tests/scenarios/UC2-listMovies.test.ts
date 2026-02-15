import { describe, it, expect, beforeAll } from 'vitest'
import { MovieServiceImpl } from '../../src/services/movie/movieService'
import { Movie } from '../../src/schemas/movies/movie-detail.schema'

describe('UC2 – Liste paginée des films', () => {
  let movieService: MovieServiceImpl

  beforeAll(() => {
    movieService = new MovieServiceImpl()
  })

  it('doit retourner les films par défaut (50 premiers)', async () => {
    const movies: Movie[] = await movieService.listMovies()
    expect(Array.isArray(movies)).toBe(true)
    expect(movies.length).toBeGreaterThan(0)
    expect(movies.length).toBeLessThanOrEqual(50) // valeur par défaut
  })

  it('doit retourner un batch spécifique avec offset et limit', async () => {
    const batch = { offset: 10, limit: 5 }
    const movies: Movie[] = await movieService.listMovies(batch)
    expect(movies.length).toBeLessThanOrEqual(5)
    movies.forEach(m => expect(m).toHaveProperty('id'))
  })

  it('doit gérer offset trop grand', async () => {
    const totalMovies = (await movieService.listMovies({ offset: 0, limit: 1000 })).length
    const movies: Movie[] = await movieService.listMovies({ offset: totalMovies + 10, limit: 5 })
    console.log(`  offset: ${totalMovies + 10}, limit: 5, results: ${movies.length}`)
    expect(movies.length).toBe(0) // pas de films si offset hors limites
  })

  it('doit gérer limit supérieur au total', async () => {
    // Récupérer le total réel de films
    const allMovies: Movie[] = await movieService.listMovies({ offset: 0, limit: 1000 })
    const totalMovies = allMovies.length

    // Demander plus que le total
    const movies: Movie[] = await movieService.listMovies({ offset: 0, limit: totalMovies + 100 })
    console.log(`  offset: 0, limit: ${totalMovies + 100}, results: ${movies.length}`)

    expect(movies.length).toBe(totalMovies) // tous les films sont retournés
  })
})

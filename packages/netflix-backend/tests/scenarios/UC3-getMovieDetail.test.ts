import { describe, it, expect, beforeAll } from 'vitest'
import { MovieServiceImpl } from '../../src/services/movie/movieService'
import { Movie } from '../../src/schemas/movies/movie-detail.schema'
import { Person } from '../../src/schemas/people/person-detail.schema'

describe('UC3 – Détail d’un film', () => {
  let movieService: MovieServiceImpl

  beforeAll(() => {
    movieService = new MovieServiceImpl()
  })

  it('doit retourner un film valide avec toutes les personnes associées', async () => {
    const movieId = 278 // choisir un film existant dans ton JSON
    const movie: Movie = await movieService.getMovieDetailById(movieId)

    expect(movie).toHaveProperty('id', movieId)
    expect(movie).toHaveProperty('title')

    // Récupérer les acteurs
    const actors: Person[] = await movieService.getPeopleFromMovie(movieId, 'Actor')
    expect(Array.isArray(actors)).toBe(true)
    console.log(`Actors: length: ${actors.length}, content:${actors}, actors(1): ${actors[1]}`)
    actors.forEach((actor, index) => {
      console.log(`${index}: ${actor}`)
    })
    expect(actors.length).toBeGreaterThan(0)
    actors.forEach(actor => expect(actor).toHaveProperty('id'))

    // Récupérer les réalisateurs
    const directors: Person[] = await movieService.getPeopleFromMovie(movieId, 'Director')
    expect(Array.isArray(directors)).toBe(true)
    directors.forEach(director => expect(director).toHaveProperty('id'))

    // Vérifier qu’il n’y a pas de doublons
    const allIds = [...actors.map(a => a.id), ...directors.map(d => d.id)]
    const uniqueIds = new Set(allIds)
    expect(uniqueIds.size).toBe(allIds.length)
  })

  it("doit échouer si le film n'existe pas", async () => {
    await expect(movieService.getMovieDetailById(999999)).rejects.toThrow()
  })

  it('doit gérer un job inconnu', async () => {
    const movieId = 1
    await expect(movieService.getPeopleFromMovie(movieId, 'MusiciansXyz')).rejects.toThrow()
  })
})

import { describe, it, expect, beforeAll } from 'vitest'
import { MovieServiceImpl } from '../../src/services/movie/movieService'
import { Movie } from '../../src/schemas/movies/movie-detail.schema'

describe('UC4 – Films similaires (mock TMDB)', () => {
  let movieService: MovieServiceImpl

  beforeAll(() => {
    movieService = new MovieServiceImpl()
  })

  it('doit retourner des films partageant au moins une catégorie', async () => {
    const movieId = 278
    const movie = await movieService.getMovieDetailById(movieId)
    const similar = await movieService.getSimilarMovies(movieId)

    expect(similar.length).toBeGreaterThan(0)

    similar.forEach(s => {
      expect(s.id).not.toBe(movieId)

      const intersection = s.categories?.filter(c => movie.categories?.includes(c))

      expect(intersection?.length).toBeGreaterThan(0)
    })
  })

  it("doit renvoyer une erreur si le film n'existe pas", async () => {
    await expect(movieService.getSimilarMovies(999999)).rejects.toThrow()
  })
})

import { describe, it, expect } from 'vitest'
import { UploadService } from '../../src/services/upload/uploadService'
import { MovieServiceImpl } from '../../src/services/movie/movieService'

describe('UC6 - Upload drag & drop', () => {
  const movieService = new MovieServiceImpl()
  const uploadService = new UploadService('./data/movies', movieService['moviesById'])

  it('ajoute un nouveau film', async () => {
    const file = { name: 'test-movie.mp4', buffer: Buffer.from('fake-content') }
    const metadata = { title: 'Test Movie', releaseYear: 2026, categories: [18, 35], rating: 7.5 }

    const movie = await uploadService.uploadMovieFile(file, metadata)
    expect(movie).toBeDefined()
    expect(movie.id).toBeGreaterThan(0)
    expect(movie.title).toBe('Test Movie')

    // Vérifier que MovieService voit le nouveau film
    const allMovies = await movieService.listMovies({ offset: 0, limit: 10000 })
    const result = allMovies.find(m => m.id === movie.id)
    expect(allMovies.find(m => m.id === movie.id)).toBeDefined()
  })
})

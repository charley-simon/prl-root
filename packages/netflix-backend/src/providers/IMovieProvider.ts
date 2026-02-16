// src/workers/providers/IMovieProvider.ts
import { Movie } from '../schemas/movies/movie-detail.schema'
import { Person } from '../schemas/people/person-detail.schema'

export interface IMovieProvider {
  /**
   * Enrichit un film et/ou les personnes associées.
   * Doit être idempotent et ne jamais lever d'erreur non capturée
   */
  enrich(movie: Movie): Promise<void>
}

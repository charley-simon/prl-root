// src/providers/tmdb/ITmdbProvider.ts
import { Provider } from '../Provider'
import {
  TmdbSearchResult,
  TmdbMovieDetails,
  TmdbMovieCredits,
  TmdbExternalIds,
  TmdbPersonDetails
} from './tmdb.types'

export interface TmdbProvider extends Provider {
  searchMovie(title: string, year?: number): Promise<TmdbSearchResult>
  getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails>
  getMovieCredits(tmdbId: number): Promise<TmdbMovieCredits>
  getMovieExternalIds(tmdbId: number): Promise<TmdbExternalIds>
  getPersonDetails(tmdbId: number): Promise<TmdbPersonDetails>
  getPersonExternalIds(tmdbId: number): Promise<TmdbExternalIds>
}

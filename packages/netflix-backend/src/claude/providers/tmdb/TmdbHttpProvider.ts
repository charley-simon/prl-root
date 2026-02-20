// src/providers/tmdb/TmdbHttpProvider.ts
import { BaseHttpProvider } from '../BaseHttpProvider'
import { TmdbProvider } from './TmdbProvider'
import {
  TmdbMovieDetails,
  TmdbMovieCredits,
  TmdbSearchResult,
  TmdbPersonDetails,
  TmdbExternalIds
} from './tmdb.types'

export class TmdbHttpProvider extends BaseHttpProvider implements TmdbProvider {
  readonly name = 'tmdb'

  constructor(apiKey: string) {
    super('https://api.themoviedb.org/3', apiKey)
  }

  async searchMovie(title: string, year?: number): Promise<TmdbSearchResult> {
    const params: Record<string, string> = { query: title }
    if (year) params.year = year.toString()
    return this.get<TmdbSearchResult>('/search/movie', params)
  }

  async getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
    return this.get<TmdbMovieDetails>(`/movie/${tmdbId}`)
  }

  async getMovieCredits(tmdbId: number): Promise<TmdbMovieCredits> {
    return this.get<TmdbMovieCredits>(`/movie/${tmdbId}/credits`)
  }

  async getMovieExternalIds(tmdbId: number): Promise<TmdbExternalIds> {
    return this.get<TmdbExternalIds>(`/movie/${tmdbId}/external_ids`)
  }

  async getPersonDetails(tmdbId: number): Promise<TmdbPersonDetails> {
    return this.get<TmdbPersonDetails>(`/person/${tmdbId}`)
  }

  async getPersonExternalIds(tmdbId: number): Promise<TmdbExternalIds> {
    return this.get<TmdbExternalIds>(`/person/${tmdbId}/external_ids`)
  }
}

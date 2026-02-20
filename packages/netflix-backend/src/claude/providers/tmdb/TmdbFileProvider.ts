// src/providers/tmdb/TmdbFileProvider.ts
import { BaseFileProvider } from '../BaseFileProvider'
import { TmdbProvider } from './TmdbProvider'
import {
  TmdbMovieDetails,
  TmdbMovieCredits,
  TmdbSearchResult,
  TmdbPersonDetails,
  TmdbExternalIds
} from './tmdb.types'

export class TmdbFileProvider extends BaseFileProvider implements TmdbProvider {
  readonly name = 'tmdb'

  constructor(basePath: string = './fixtures/tmdb') {
    super(basePath)
  }

  async searchMovie(title: string, year?: number): Promise<TmdbSearchResult> {
    return this.read<TmdbSearchResult>(`/search/${title.toLowerCase()}.json`)
  }

  async getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails> {
    return this.read<TmdbMovieDetails>(`/movies/${tmdbId}/details.json`)
  }

  async getMovieCredits(tmdbId: number): Promise<TmdbMovieCredits> {
    return this.read<TmdbMovieCredits>(`/movies/${tmdbId}/credits.json`)
  }

  async getMovieExternalIds(tmdbId: number): Promise<TmdbExternalIds> {
    return this.read<TmdbExternalIds>(`/movies/${tmdbId}/external_ids.json`)
  }

  async getPersonDetails(tmdbId: number): Promise<TmdbPersonDetails> {
    return this.read<TmdbPersonDetails>(`/persons/${tmdbId}/details.json`)
  }

  async getPersonExternalIds(tmdbId: number): Promise<TmdbExternalIds> {
    return this.read<TmdbExternalIds>(`/persons/${tmdbId}/external_ids.json`)
  }
}

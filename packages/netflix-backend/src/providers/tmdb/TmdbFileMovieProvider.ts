import fs from 'fs'
import path from 'path'
import { TmdbMovieDetails, TmdbMovieCredits, TmdbExternalIds } from './tmdb.types'
import { Movie } from '../../schemas/movies/movie-detail.schema'
import { Person } from '../../schemas/people/person-detail.schema'
import { IEntityProvider } from '../EntityProvider'

export class TmdbFileMovieProvider implements IEntityProvider<Movie> {
  constructor(private baseDir: string) {}

  async enrich(movie: Movie): Promise<Movie> {
    const tmdbIds: TmdbExternalIds = await this.getExternalIds(movie.id)
    movie.externalsIds = {
      tmdb: tmdbIds.id,
      imdb: tmdbIds.imdb_id,
      wikidata: tmdbIds.wikidata_id
    }
    console.log(
      `TmdbFileMovieProvider.enrich(${movie.id}, Ids: ${movie.externalsIds.tmdb}, ${movie.externalsIds.imdb}, ${movie.externalsIds.wikidata})`
    )
    return movie
  }

  private async readJson<T>(fileName: string): Promise<T> {
    const filePath = path.join(this.baseDir, fileName)
    const raw = await fs.promises.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T
  }

  async getMovieDetails(id: number): Promise<TmdbMovieDetails> {
    return this.readJson<TmdbMovieDetails>(`${id}-Movie-Details.json`)
  }

  async getExternalIds(id: number): Promise<TmdbExternalIds> {
    return this.readJson<TmdbExternalIds>(`${id}-Movie-ExternalIds.json`)
  }

  async getCredits(id: number): Promise<TmdbMovieCredits> {
    return this.readJson<TmdbMovieCredits>(`${id}-Movie-Credits.json`)
  }

  async getImage(fileName: string): Promise<ArrayBuffer> {
    const filePath = path.join(this.baseDir, 'images', 'originals', fileName)
    const buffer = await fs.promises.readFile(filePath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  }
}

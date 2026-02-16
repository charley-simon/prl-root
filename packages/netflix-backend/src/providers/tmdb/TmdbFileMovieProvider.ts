import fs from 'fs'
import path from 'path'
import { TmdbMovieDetails, TmdbMovieCredits, TmdbExternalIds } from './tmdb.types'

export class TmdbFileMovieProvider {
  constructor(private baseDir: string) {}

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

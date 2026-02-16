import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { TmdbMovieDetails, TmdbMovieCredits, TmdbExternalIds, TmdbMovieImages } from './tmdb.types'

export class TmdbHttpMovieProvider {
  constructor(private token: string) {}

  private get headers() {
    return { Authorization: `Bearer ${this.token}`, Accept: 'application/json' }
  }

  private async getJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: this.headers })
    if (!res.ok) throw new Error(`HTTP error ${res.status} for ${url}`)
    return res.json() as Promise<T>
  }

  private async getImageData(filePath: string): Promise<ArrayBuffer> {
    const url = `https://image.tmdb.org/t/p/original${filePath}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Cannot fetch image ${filePath}`)
    return await res.arrayBuffer()
  }

  /** Fetch basic movie data: details, externalIds, poster/backdrop paths */
  async fetchBasic(id: number) {
    const details = await this.getJson<TmdbMovieDetails>(
      `https://api.themoviedb.org/3/movie/${id}?language=fr-FR`
    )
    const externalIds = await this.getJson<TmdbExternalIds>(
      `https://api.themoviedb.org/3/movie/${id}/external_ids`
    )
    return { details, externalIds }
  }

  /** Fetch full credits (cast/crew) */
  async fetchCredits(id: number) {
    return this.getJson<TmdbMovieCredits>(
      `https://api.themoviedb.org/3/movie/${id}/credits?language=fr-FR`
    )
  }

  /** Fetch images needed for integration: poster + backdrop */
  async fetchImages(details: TmdbMovieDetails) {
    const images: Record<string, ArrayBuffer> = {}
    if (details.poster_path) images['poster'] = await this.getImageData(details.poster_path)
    if (details.backdrop_path) images['backdrop'] = await this.getImageData(details.backdrop_path)
    return images
  }

  /** Save snapshot JSON + images to disk for offline replay */
  async saveSnapshot(id: number, outputDir: string) {
    const { details, externalIds } = await this.fetchBasic(id)
    const credits = await this.fetchCredits(id)
    const images = await this.fetchImages(details)

    // create directories
    await fs.promises.mkdir(outputDir, { recursive: true })
    const imagesDir = path.join(outputDir, 'images', 'originals')
    await fs.promises.mkdir(imagesDir, { recursive: true })

    // save JSON
    await fs.promises.writeFile(
      path.join(outputDir, `${id}-Movie-Details.json`),
      JSON.stringify(details, null, 2)
    )
    await fs.promises.writeFile(
      path.join(outputDir, `${id}-Movie-ExternalIds.json`),
      JSON.stringify(externalIds, null, 2)
    )
    await fs.promises.writeFile(
      path.join(outputDir, `${id}-Movie-Credits.json`),
      JSON.stringify(credits, null, 2)
    )

    // save images (originals, paths intact)
    for (const [type, buffer] of Object.entries(images)) {
      const ext = '.jpg' // TMDB originals usually jpg
      const fileName = `${id}-${type}${ext}`
      await fs.promises.writeFile(path.join(imagesDir, fileName), Buffer.from(buffer))
    }

    // save production companies logos
    if (details.production_companies) {
      const companiesDir = path.join(path.dirname(outputDir), '../assets/companies')
      await fs.promises.mkdir(companiesDir, { recursive: true })

      for (const company of details.production_companies) {
        if (!company.logo_path) continue
        const logoBuffer = await this.getImageData(company.logo_path)
        const logoFile = path.join(companiesDir, `${company.id}-logo.png`)
        await fs.promises.writeFile(logoFile, Buffer.from(logoBuffer))
      }
    }
  }
}

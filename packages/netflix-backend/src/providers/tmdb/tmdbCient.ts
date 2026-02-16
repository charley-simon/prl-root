import { TmdbMovieDetails, TmdbMovieCredits, TmdbExternalIds, TmdbImages } from './tmdb.types'

export class TmdbClient {
  constructor(
    private token: string,
    private language = 'fr-FR'
  ) {}

  private async request<T>(path: string): Promise<T> {
    const url = new URL(`https://api.themoviedb.org/3${path}`)
    url.searchParams.set('language', this.language)

    const res = await fetch(url, {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.token}`
      }
    })

    if (!res.ok) {
      throw new Error(`TMDB error ${res.status} on ${path}`)
    }

    return res.json() as Promise<T>
  }

  getMovie(id: number) {
    return this.request<TmdbMovieDetails>(`/movie/${id}`)
  }

  getExternalIds(id: number) {
    return this.request<TmdbExternalIds>(`/movie/${id}/external_ids`)
  }

  getCredits(id: number) {
    return this.request<TmdbMovieCredits>(`/movie/${id}/credits`)
  }

  getImages(id: number) {
    return this.request<TmdbImages>(`/movie/${id}/images`)
  }
}

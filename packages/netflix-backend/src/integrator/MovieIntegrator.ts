import { TmdbMovieBundle } from '../providers/tmdb/tmdb.types'

export interface Movie {
  id: number
  title: string
  year: number
  poster: string
  backdrop: string
  cast: Array<{ id: number; name: string; character: string }>
  crew: Array<{ id: number; name: string; job: string }>
}

export class MovieIntegrator {
  async integrate(bundle: TmdbMovieBundle): Promise<Movie> {
    const details = bundle.details
    const credits = bundle.credits
    const images = bundle.images

    return {
      id: details.id,
      title: details.title,
      year: details.release_date ? parseInt(details.release_date.split('-')[0]) : 0,
      poster: images?.posters?.[0]?.file_path || '',
      backdrop: images?.backdrops?.[0]?.file_path || '',
      cast:
        credits?.cast?.map(c => ({
          id: c.id,
          name: c.name,
          character: c.character
        })) || [],
      crew:
        credits?.crew?.map(c => ({
          id: c.id,
          name: c.name,
          job: c.job
        })) || []
    }
  }
}

import { IMovieProvider } from '../providers/IMovieProvider'
import { Movie, EnrichLevel } from '../models/types'
import { engineEvents, EngineEventType, statsEvents, StatsEventType } from '../events/events'

export class MovieRepository {
  private movies: Map<number, Movie> = new Map()

  constructor(private providers: IMovieProvider[]) {}

  createMinimal(id: number, title: string, filePath: string): Movie {
    const movie: Movie = {
      id,
      title,
      filePath,
      status: 'initial',
      stats: { lastAccess: Date.now(), views: 0 },
      data: {}
    }
    this.movies.set(id, movie)
    return movie
  }

  get(id: number): Movie | undefined {
    return this.movies.get(id)
  }

  async enrich(movie: Movie, level: EnrichLevel): Promise<void> {
    for (const provider of this.providers) {
      const bundle = await provider.getDetails(movie.id, level)
      movie.data = { ...movie.data, ...bundle }
    }
    movie.status = level === 'basic' ? 'basic' : level === 'medium' ? 'medium' : 'complete'
    engineEvents.emit(EngineEventType.EnrichmentDone, { movieId: movie.id, level })
  }

  recordView(movie: Movie) {
    movie.stats.lastAccess = Date.now()
    movie.stats.views += 1
    statsEvents.emit(StatsEventType.MovieViewed, { movieId: movie.id, timestamp: Date.now() })
  }

  maybeDowngrade(movie: Movie, maxAgeDays: number = 90, minViews: number = 3) {
    const THRESHOLD = maxAgeDays * 24 * 3600 * 1000
    if (Date.now() - movie.stats.lastAccess > THRESHOLD && movie.stats.views < minViews) {
      movie.status = 'basic'
      engineEvents.emit(EngineEventType.DowngradePerformed, { movieId: movie.id })
    }
  }
}

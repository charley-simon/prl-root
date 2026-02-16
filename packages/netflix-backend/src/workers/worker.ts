// src/workers/worker.ts
import fs from 'fs'
import path from 'path'
import { Movie } from '../schemas/movies/movie-detail.schema'
import { IMovieProvider } from '../providers/IMovieProvider'
import { MetricsRegistry } from '../services/monitoring/metricsRegistry'

const DATA_DIR = path.resolve('./data/movies')
const metricsRegistry = new MetricsRegistry()

export class Worker {
  constructor(private providers: IMovieProvider[]) {}

  async process(movie: Movie): Promise<Movie> {
    const startTime = Date.now()

    try {
      for (const provider of this.providers) {
        await provider.enrich(movie)
      }

      // Sauvegarde JSON sur disque
      const movieJsonPath = path.join(DATA_DIR, `${movie.id}-movie.json`)
      fs.writeFileSync(movieJsonPath, JSON.stringify(movie, null, 2), 'utf-8')

      // Metrics
      const duration = Date.now() - startTime
      metricsRegistry.histogram('worker.process.duration').record(duration)

      return movie
    } catch (err: any) {
      metricsRegistry.counter('worker.process.failed').inc()
      throw err
    }
  }
}

/**
import { Worker } from './workers/worker'
import { TMDBProvider } from './workers/providers/tmdbProvider'
import { WikipediaProvider } from './workers/providers/wikipediaProvider'
import { MovieServiceImpl } from './services/movie/movieService'

const movieService = new MovieServiceImpl()
const providers = [new TMDBProvider(), new WikipediaProvider()]
const worker = new Worker(providers)

async function run() {
  const movie = await movieService.getMovieDetailById(320288)
  await worker.process(movie)
}

run()
 */

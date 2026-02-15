/**
 * IMDB provider mock.
 *
 * Simule un appel IMDB à partir d’un fichier JSON local.
 * Utilisé pour valider :
 * - multi-provider resolution
 * - fallback
 * - instrumentation
 */

import { Movie } from "../../domain/movie/Movie";
import { MetricsRegistry } from "../../instrumentation/MetricsRegistry";
import { MovieProvider } from "../../application/ports/MovieProvider";

interface ImdbJsonProviderOptions {
  mockData?: Record<string, Movie>;
}

export class ImdbJsonProvider implements MovieProvider {
  private movies: Record<string, Movie> = {};

  constructor(options?: ImdbJsonProviderOptions) {
    if (options?.mockData) {
      this.movies = options.mockData;
    }
  }

  /**
   * Récupère un film par id depuis le JSON IMDB ou le mock
   */
  async fetchById(id: string): Promise<Movie> {
    const start = performance.now(); // <-- start timer

    const movie = this.movies[id];
    if (!movie) {
      const end = performance.now(); // <-- end timer
      MetricsRegistry.incrementTimer("ImdbJsonProvider.fetchById", end - start);
      throw new Error(`Movie with id ${id} not found in IMDB JSON provider`);
    }

    const end = performance.now(); // <-- end timer
    MetricsRegistry.incrementTimer("ImdbJsonProvider.fetchById", end - start);
    return movie;
  }
}

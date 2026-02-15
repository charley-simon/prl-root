/**
 * Resolves movies from multiple sources.
 *
 * Resolution strategy:
 * 1. Local repository
 * 2. External providers (ordered)
 * 3. Persist resolved entity
 *
 * This class contains NO instrumentation
 * and NO transport logic.
 */

import { Movie } from "../../domain/movie/Movie";
import { MovieRepository } from "../ports/MovieRepository";
import { MovieProvider } from "../ports/MovieProvider";
import { MetricsRegistry } from "../../instrumentation/MetricsRegistry";

interface MovieResolverOptions {
  repo: MovieRepository;
  providers: MovieProvider[];
  instrumentation?: typeof MetricsRegistry;
}

export class MovieResolver {
  private repo: MovieRepository;
  private providers: MovieProvider[];
  private instrumentation: typeof MetricsRegistry;

  constructor(options: MovieResolverOptions) {
    this.repo = options.repo;
    this.providers = options.providers;
    this.instrumentation = options.instrumentation ?? MetricsRegistry;
  }

  async getById(id: string): Promise<Movie> {
    const start = performance.now();

    // Vérifie si le film est déjà dans le repository (cache)
    let movie = await this.repo.findById(id);
    if (movie) {
      const endHit = performance.now();
      this.instrumentation.incrementTimer(
        "MovieResolver.getById",
        endHit - start,
      );
      return movie;
    }

    // Parcourt les providers pour récupérer le film
    for (const provider of this.providers) {
      try {
        movie = await provider.fetchById(id);
        if (movie) {
          await this.repo.save(movie); // sauvegarde dans le repo (cache)
          const endProvider = performance.now();
          this.instrumentation.incrementTimer(
            "MovieResolver.getById",
            endProvider - start,
          );
          return movie;
        }
      } catch {
        // ignore et passe au provider suivant
      }
    }

    const end = performance.now();
    this.instrumentation.incrementTimer("MovieResolver.getById", end - start);
    throw new Error(`Movie with id ${id} not found in cache and any provider`);
  }
}

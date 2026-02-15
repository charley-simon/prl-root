import { MovieResolver } from "../services/MovieResolver";
import { Instrumentation } from "../../observability/Instrumentation";

/**
 * Use case: resolve a movie by its identifier.
 *
 * Orchestration layer:
 * - applies instrumentation
 * - no business logic
 *
 * ResolveMovieById:
 * cherche en local (Mongo mock / in-memory)
 * sinon appelle un provider TMDB mock (JSON)
 * mappe vers le domaine
 * sauvegarde
 * retourne un Movie
 */

export class ResolveMovieById {
  constructor(
    private readonly resolver: MovieResolver,
    private readonly instrumentation: Instrumentation,
  ) {}

  async execute(id: string) {
    const span = this.instrumentation.startSpan("ResolveMovieById", {
      movieId: id,
    });

    try {
      const result = await this.resolver.getById(id);
      span.end(result);
      return result;
    } catch (err) {
      span.error(err);
      throw err;
    }
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveMovieById = void 0;
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
class ResolveMovieById {
    constructor(resolver, instrumentation) {
        this.resolver = resolver;
        this.instrumentation = instrumentation;
    }
    async execute(id) {
        const span = this.instrumentation.startSpan("ResolveMovieById", {
            movieId: id,
        });
        try {
            const result = await this.resolver.getById(id);
            span.end(result);
            return result;
        }
        catch (err) {
            span.error(err);
            throw err;
        }
    }
}
exports.ResolveMovieById = ResolveMovieById;

"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieResolver = void 0;
const MetricsRegistry_1 = require("../../instrumentation/MetricsRegistry");
class MovieResolver {
    constructor(options) {
        this.repo = options.repo;
        this.providers = options.providers;
        this.instrumentation = options.instrumentation ?? MetricsRegistry_1.MetricsRegistry;
    }
    async getById(id) {
        const start = performance.now();
        // Vérifie si le film est déjà dans le repository (cache)
        let movie = await this.repo.findById(id);
        if (movie) {
            const endHit = performance.now();
            this.instrumentation.incrementTimer("MovieResolver.getById", endHit - start);
            return movie;
        }
        // Parcourt les providers pour récupérer le film
        for (const provider of this.providers) {
            try {
                movie = await provider.fetchById(id);
                if (movie) {
                    await this.repo.save(movie); // sauvegarde dans le repo (cache)
                    const endProvider = performance.now();
                    this.instrumentation.incrementTimer("MovieResolver.getById", endProvider - start);
                    return movie;
                }
            }
            catch {
                // ignore et passe au provider suivant
            }
        }
        const end = performance.now();
        this.instrumentation.incrementTimer("MovieResolver.getById", end - start);
        throw new Error(`Movie with id ${id} not found in cache and any provider`);
    }
}
exports.MovieResolver = MovieResolver;

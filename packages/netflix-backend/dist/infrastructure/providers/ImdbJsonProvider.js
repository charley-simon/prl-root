"use strict";
/**
 * IMDB provider mock.
 *
 * Simule un appel IMDB à partir d’un fichier JSON local.
 * Utilisé pour valider :
 * - multi-provider resolution
 * - fallback
 * - instrumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImdbJsonProvider = void 0;
const MetricsRegistry_1 = require("../../instrumentation/MetricsRegistry");
class ImdbJsonProvider {
    constructor(options) {
        this.movies = {};
        if (options?.mockData) {
            this.movies = options.mockData;
        }
    }
    /**
     * Récupère un film par id depuis le JSON IMDB ou le mock
     */
    async fetchById(id) {
        const start = performance.now(); // <-- start timer
        const movie = this.movies[id];
        if (!movie) {
            const end = performance.now(); // <-- end timer
            MetricsRegistry_1.MetricsRegistry.incrementTimer("ImdbJsonProvider.fetchById", end - start);
            throw new Error(`Movie with id ${id} not found in IMDB JSON provider`);
        }
        const end = performance.now(); // <-- end timer
        MetricsRegistry_1.MetricsRegistry.incrementTimer("ImdbJsonProvider.fetchById", end - start);
        return movie;
    }
}
exports.ImdbJsonProvider = ImdbJsonProvider;

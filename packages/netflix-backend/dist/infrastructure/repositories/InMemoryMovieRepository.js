"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryMovieRepository = void 0;
const InMemoryCache_1 = require("../../../src/cache/InMemoryCache");
const MetricsRegistry_1 = require("../../instrumentation/MetricsRegistry");
/**
 * Repository InMemory utilisant InMemoryCache avec instrumentation
 */
class InMemoryMovieRepository {
    constructor() {
        this.cache = new InMemoryCache_1.InMemoryCache(MetricsRegistry_1.MetricsRegistry);
    }
    async findById(id) {
        return this.cache.get(id);
    }
    async save(movie) {
        this.cache.set(movie.id, movie);
    }
    async clear() {
        this.cache.clear();
    }
}
exports.InMemoryMovieRepository = InMemoryMovieRepository;

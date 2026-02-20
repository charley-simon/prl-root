"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieRepository = void 0;
const events_1 = require("../events/events");
class MovieRepository {
    constructor(providers) {
        this.providers = providers;
        this.movies = new Map();
    }
    createMinimal(id, title, filePath) {
        const movie = {
            id,
            title,
            filePath,
            status: 'initial',
            stats: { lastAccess: Date.now(), views: 0 },
            data: {}
        };
        this.movies.set(id, movie);
        return movie;
    }
    get(id) {
        return this.movies.get(id);
    }
    async enrich(movie, level) {
        for (const provider of this.providers) {
            const bundle = await provider.getDetails(movie.id, level);
            movie.data = { ...movie.data, ...bundle };
        }
        movie.status = level === 'basic' ? 'basic' : level === 'medium' ? 'medium' : 'complete';
        events_1.engineEvents.emit(events_1.EngineEventType.EnrichmentDone, { movieId: movie.id, level });
    }
    recordView(movie) {
        movie.stats.lastAccess = Date.now();
        movie.stats.views += 1;
        events_1.statsEvents.emit(events_1.StatsEventType.MovieViewed, { movieId: movie.id, timestamp: Date.now() });
    }
    maybeDowngrade(movie, maxAgeDays = 90, minViews = 3) {
        const THRESHOLD = maxAgeDays * 24 * 3600 * 1000;
        if (Date.now() - movie.stats.lastAccess > THRESHOLD && movie.stats.views < minViews) {
            movie.status = 'basic';
            events_1.engineEvents.emit(events_1.EngineEventType.DowngradePerformed, { movieId: movie.id });
        }
    }
}
exports.MovieRepository = MovieRepository;

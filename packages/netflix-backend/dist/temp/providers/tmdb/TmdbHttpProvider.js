"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbHttpProvider = void 0;
// src/providers/tmdb/TmdbHttpProvider.ts
const BaseHttpProvider_1 = require("../BaseHttpProvider");
class TmdbHttpProvider extends BaseHttpProvider_1.BaseHttpProvider {
    constructor(apiKey) {
        super('https://api.themoviedb.org/3', apiKey);
        this.name = 'tmdb';
    }
    async searchMovie(title, year) {
        const params = { query: title };
        if (year)
            params.year = year.toString();
        return this.get('/search/movie', params);
    }
    async getMovieDetails(tmdbId) {
        return this.get(`/movie/${tmdbId}`);
    }
    async getMovieCredits(tmdbId) {
        return this.get(`/movie/${tmdbId}/credits`);
    }
    async getMovieExternalIds(tmdbId) {
        return this.get(`/movie/${tmdbId}/external_ids`);
    }
    async getPersonDetails(tmdbId) {
        return this.get(`/person/${tmdbId}`);
    }
    async getPersonExternalIds(tmdbId) {
        return this.get(`/person/${tmdbId}/external_ids`);
    }
}
exports.TmdbHttpProvider = TmdbHttpProvider;

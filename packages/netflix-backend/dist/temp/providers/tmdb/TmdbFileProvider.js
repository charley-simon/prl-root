"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbFileProvider = void 0;
// src/providers/tmdb/TmdbFileProvider.ts
const BaseFileProvider_1 = require("../BaseFileProvider");
class TmdbFileProvider extends BaseFileProvider_1.BaseFileProvider {
    constructor(basePath = './fixtures/tmdb') {
        super(basePath);
        this.name = 'tmdb';
    }
    async searchMovie(title, year) {
        return this.read(`/search/${title.toLowerCase()}.json`);
    }
    async getMovieDetails(tmdbId) {
        return this.read(`/movies/${tmdbId}/details.json`);
    }
    async getMovieCredits(tmdbId) {
        return this.read(`/movies/${tmdbId}/credits.json`);
    }
    async getMovieExternalIds(tmdbId) {
        return this.read(`/movies/${tmdbId}/external_ids.json`);
    }
    async getPersonDetails(tmdbId) {
        return this.read(`/persons/${tmdbId}/details.json`);
    }
    async getPersonExternalIds(tmdbId) {
        return this.read(`/persons/${tmdbId}/external_ids.json`);
    }
}
exports.TmdbFileProvider = TmdbFileProvider;

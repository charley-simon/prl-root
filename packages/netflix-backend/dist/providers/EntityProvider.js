"use strict";
// src/workers/providers/IEntityProvider.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbHttpMovieProvider = exports.TmdbHttpPeopleProvider = void 0;
class TmdbHttpPeopleProvider {
    async enrich(person) {
        // code
        return person;
    }
}
exports.TmdbHttpPeopleProvider = TmdbHttpPeopleProvider;
class TmdbHttpMovieProvider {
    async enrich(movie) {
        // code
        return movie;
    }
}
exports.TmdbHttpMovieProvider = TmdbHttpMovieProvider;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieTransformer = void 0;
const id_utils_1 = require("../utils/id.utils");
class MovieTransformer {
    constructor(tmdb, // Injecté, pas instancié ici
    wikipedia) {
        this.tmdb = tmdb;
        this.wikipedia = wikipedia;
    }
    async searchMovie(criteria) {
        const results = await this.tmdb.searchMovie(criteria.title, criteria.year);
        // Logique de sélection du meilleur résultat
        const best = results.results[0];
        return (0, id_utils_1.generateInternalId)('tmdb', best.id);
    }
    async create(kind, id, level) {
        // Délègue à enrich depuis un objet vide
        const empty = {
            id: id,
            kind: 'Movie',
            externalIds: {},
            title: 'Unknow',
            status: undefined,
            releaseYear: 1900
        };
        return this.enrich(empty, level);
    }
    // enrich<T extends Entity>(entity: T, targetLevel: EnrichLevel): Promise<T>
    async enrich(entity, targetLevel) {
        const tmdbId = Number(entity.externalIds['tmdb']);
        // basic : titre, année, poster
        if (targetLevel === 'basic' || targetLevel === 'medium' || targetLevel === 'deep') {
            const details = await this.tmdb.getMovieDetails(tmdbId);
            entity = this.applyBasic(entity, details);
        }
        // medium : crédits (cast, crew)
        if (targetLevel === 'medium' || targetLevel === 'deep') {
            const credits = await this.tmdb.getMovieCredits(tmdbId);
            entity = this.applyCredits(entity, credits);
        }
        // deep : Wikipedia, IDs externes supplémentaires
        if (targetLevel === 'deep') {
            const wiki = await this.wikipedia.getMovieSummary(entity.title, entity.releaseYear);
            entity = this.applyWikipedia(entity, wiki);
        }
        entity.status = targetLevel;
        return entity;
    }
    applyBasic(movie, details) {
        return {
            ...movie,
            title: details.title
            // year: parseInt(details.release_date.split('-')[0]),
            // posterPath: details.poster_path,
            // backdropPath: details.backdrop_path
        };
    }
    applyCredits(movie, credits) {
        return {
            ...movie
            //cast: credits.cast.map(c => ({ name: c.name, character: c.character })),
            //directors: credits.crew.filter(c: => c.job === 'Director').map(c => c.name)
        };
    }
    applyWikipedia(movie, wiki) {
        return {
            ...movie,
            synopsis: wiki.extract
        };
    }
}
exports.MovieTransformer = MovieTransformer;

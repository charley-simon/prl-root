"use strict";
// src/loader/EntityLoader.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityLoader = void 0;
class EntityLoader {
    constructor(cache, transformers, validator) {
        this.cache = cache;
        this.transformers = transformers;
        this.validator = validator;
    }
    getTransformer(kind) {
        const transformer = this.transformers.get(kind);
        if (!transformer)
            throw new Error(`No transformer registered for kind: ${kind}`);
        return transformer;
    }
    // Résolution d'un UUID interne depuis des critères flous (titre, année...)
    // Cherche en local d'abord, puis délègue à un provider de recherche si absent
    async resolveMovieBy(criteria) {
        const cached = await this.cache.findMovie(criteria);
        if (cached)
            return cached.id;
        // Délègue la recherche externe (ex: TMDB search)
        return this.getTransformer('Movie').searchMovie(criteria);
    }
    async getMovieById(id, level = 'basic') {
        return this.getById('Movie', id, level);
    }
    async getPersonById(id, level = 'basic') {
        return this.getById('Person', id, level);
    }
    async getById(kind, id, level) {
        let entity = await this.cache.get(kind, id);
        if (!entity) {
            entity = await this.getTransformer(kind).create(kind, id, 'basic');
            await this.cache.set(entity);
        }
        if (this.isSufficient(entity.status, level))
            return entity;
        return this.enrich(entity, level);
    }
    async enrich(entity, targetLevel) {
        this.validator.validate(entity);
        const enriched = await this.getTransformer(entity.kind).enrich(entity, targetLevel);
        this.validator.validate(enriched);
        await this.cache.set(enriched);
        return enriched;
    }
    // basic < medium < deep
    isSufficient(current, requested) {
        const order = ['basic', 'medium', 'deep'];
        const currentIdx = order.indexOf(current ?? 'basic');
        const requestedIdx = order.indexOf(requested);
        return currentIdx >= requestedIdx;
    }
}
exports.EntityLoader = EntityLoader;

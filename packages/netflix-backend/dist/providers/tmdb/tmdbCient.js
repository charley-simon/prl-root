"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbClient = void 0;
class TmdbClient {
    constructor(token, language = 'fr-FR') {
        this.token = token;
        this.language = language;
    }
    async request(path) {
        const url = new URL(`https://api.themoviedb.org/3${path}`);
        url.searchParams.set('language', this.language);
        const res = await fetch(url, {
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${this.token}`
            }
        });
        if (!res.ok) {
            throw new Error(`TMDB error ${res.status} on ${path}`);
        }
        return res.json();
    }
    getMovie(id) {
        return this.request(`/movie/${id}`);
    }
    getExternalIds(id) {
        return this.request(`/movie/${id}/external_ids`);
    }
    getCredits(id) {
        return this.request(`/movie/${id}/credits`);
    }
    getImages(id) {
        return this.request(`/movie/${id}/images`);
    }
}
exports.TmdbClient = TmdbClient;

"use strict";
// config.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    tmdbToken: process.env.TMDB_TOKEN ?? '',
    assetsDir: process.env.ASSETS_DIR ?? './data/assets/movies',
    language: 'fr-FR'
};
if (!exports.config.tmdbToken) {
    throw new Error('TMDB_TOKEN manquant dans le .env');
}

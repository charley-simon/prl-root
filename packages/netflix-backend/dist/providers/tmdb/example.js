"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// example.ts
require("dotenv/config"); // charge automatiquement .env à la racine
const httpClient_1 = require("./httpClient");
const config_1 = require("./config");
const imageService_1 = require("./imageService");
const tmdbMovieRepository_1 = require("./tmdbMovieRepository");
async function main() {
    const http = new httpClient_1.HttpClient(config_1.config.tmdbToken);
    const repo = new tmdbMovieRepository_1.TmdbMovieRepository(http);
    const imageService = new imageService_1.ImageService();
    const movieId = 550;
    const details = await repo.getDetails(movieId);
    console.log('Titre:', details.title);
    const credits = await repo.getCredits(movieId);
    console.log('Acteurs:', credits.cast.length);
    const external = await repo.getExternalIds(movieId);
    console.log('IMDB:', external.imdb_id);
    if (details.poster_path) {
        const buffer = await repo.getImage(details.poster_path);
        await imageService.saveAvif(buffer, `${config_1.config.assetsDir}/${movieId}-poster.avif`);
        await imageService.saveVariants(buffer, `${config_1.config.assetsDir}/${movieId}-poster`, [100, 500, 1000]);
    }
    if (details.backdrop_path) {
        const buffer = await repo.getImage(details.backdrop_path);
        await imageService.saveVariants(buffer, `${config_1.config.assetsDir}/${movieId}-backdrop`, [300, 800, 1280]);
    }
}
main();

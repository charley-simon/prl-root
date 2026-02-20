"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbFileMovieProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class TmdbFileMovieProvider {
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    async enrich(movie) {
        const tmdbIds = await this.getExternalIds(movie.id);
        movie.externalsIds = {
            tmdb: tmdbIds.id,
            imdb: tmdbIds.imdb_id,
            wikidata: tmdbIds.wikidata_id
        };
        console.log(`TmdbFileMovieProvider.enrich(${movie.id}, Ids: ${movie.externalsIds.tmdb}, ${movie.externalsIds.imdb}, ${movie.externalsIds.wikidata})`);
        return movie;
    }
    async readJson(fileName) {
        const filePath = path_1.default.join(this.baseDir, fileName);
        const raw = await fs_1.default.promises.readFile(filePath, 'utf-8');
        return JSON.parse(raw);
    }
    async getMovieDetails(id) {
        return this.readJson(`${id}-Movie-Details.json`);
    }
    async getExternalIds(id) {
        return this.readJson(`${id}-Movie-ExternalIds.json`);
    }
    async getCredits(id) {
        return this.readJson(`${id}-Movie-Credits.json`);
    }
    async getImage(fileName) {
        const filePath = path_1.default.join(this.baseDir, 'images', 'originals', fileName);
        const buffer = await fs_1.default.promises.readFile(filePath);
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
}
exports.TmdbFileMovieProvider = TmdbFileMovieProvider;

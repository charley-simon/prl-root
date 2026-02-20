"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbHttpMovieProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class TmdbHttpMovieProvider {
    constructor(token) {
        this.token = token;
    }
    async enrich(movie) {
        return movie;
    }
    get headers() {
        return { Authorization: `Bearer ${this.token}`, Accept: 'application/json' };
    }
    async getJson(url) {
        const res = await (0, node_fetch_1.default)(url, { headers: this.headers });
        if (!res.ok)
            throw new Error(`HTTP error ${res.status} for ${url}`);
        return res.json();
    }
    async getImageData(filePath) {
        const url = `https://image.tmdb.org/t/p/original${filePath}`;
        const res = await (0, node_fetch_1.default)(url);
        if (!res.ok)
            throw new Error(`Cannot fetch image ${filePath}`);
        return await res.arrayBuffer();
    }
    /** Fetch basic movie data: details, externalIds, poster/backdrop paths */
    async fetchBasic(id) {
        const details = await this.getJson(`https://api.themoviedb.org/3/movie/${id}?language=fr-FR`);
        const externalIds = await this.getJson(`https://api.themoviedb.org/3/movie/${id}/external_ids`);
        return { details, externalIds };
    }
    /** Fetch full credits (cast/crew) */
    async fetchCredits(id) {
        return this.getJson(`https://api.themoviedb.org/3/movie/${id}/credits?language=fr-FR`);
    }
    /** Fetch images needed for integration: poster + backdrop */
    async fetchImages(details) {
        const images = {};
        if (details.poster_path)
            images['poster'] = await this.getImageData(details.poster_path);
        if (details.backdrop_path)
            images['backdrop'] = await this.getImageData(details.backdrop_path);
        return images;
    }
    /** Save snapshot JSON + images to disk for offline replay */
    async saveSnapshot(id, outputDir) {
        const { details, externalIds } = await this.fetchBasic(id);
        const credits = await this.fetchCredits(id);
        const images = await this.fetchImages(details);
        // create directories
        await fs_1.default.promises.mkdir(outputDir, { recursive: true });
        const imagesDir = path_1.default.join(outputDir, 'images', 'originals');
        await fs_1.default.promises.mkdir(imagesDir, { recursive: true });
        // save JSON
        await fs_1.default.promises.writeFile(path_1.default.join(outputDir, `${id}-Movie-Details.json`), JSON.stringify(details, null, 2));
        await fs_1.default.promises.writeFile(path_1.default.join(outputDir, `${id}-Movie-ExternalIds.json`), JSON.stringify(externalIds, null, 2));
        await fs_1.default.promises.writeFile(path_1.default.join(outputDir, `${id}-Movie-Credits.json`), JSON.stringify(credits, null, 2));
        // save images (originals, paths intact)
        for (const [type, buffer] of Object.entries(images)) {
            const ext = '.jpg'; // TMDB originals usually jpg
            const fileName = `${id}-${type}${ext}`;
            await fs_1.default.promises.writeFile(path_1.default.join(imagesDir, fileName), Buffer.from(buffer));
        }
        // save production companies logos
        if (details.production_companies) {
            const companiesDir = path_1.default.join(path_1.default.dirname(outputDir), '../assets/companies');
            await fs_1.default.promises.mkdir(companiesDir, { recursive: true });
            for (const company of details.production_companies) {
                if (!company.logo_path)
                    continue;
                const logoBuffer = await this.getImageData(company.logo_path);
                const logoFile = path_1.default.join(companiesDir, `${company.id}-logo.png`);
                await fs_1.default.promises.writeFile(logoFile, Buffer.from(logoBuffer));
            }
        }
    }
}
exports.TmdbHttpMovieProvider = TmdbHttpMovieProvider;

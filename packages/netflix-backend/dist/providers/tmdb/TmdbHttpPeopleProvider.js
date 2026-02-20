"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbHttpPeopleProvider = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class TmdbHttpPeopleProvider {
    constructor(token) {
        this.token = token;
    }
    async enrich(person) {
        const result = person.name;
        return person;
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
    async fetchBasic(id) {
        return this.getJson(`https://api.themoviedb.org/3/person/${id}?language=fr-FR`);
    }
    async saveSnapshot(id, outputDir) {
        const person = await this.fetchBasic(id);
        await fs_1.default.promises.mkdir(outputDir, { recursive: true });
        await fs_1.default.promises.writeFile(path_1.default.join(outputDir, `${id}-Person-Details.json`), JSON.stringify(person, null, 2));
        if (person.profile_path) {
            const imagesDir = path_1.default.join(outputDir, 'images', 'originals');
            await fs_1.default.promises.mkdir(imagesDir, { recursive: true });
            const buffer = await this.getImageData(person.profile_path);
            const ext = '.jpg';
            const fileName = `${id}-profile${ext}`;
            await fs_1.default.promises.writeFile(path_1.default.join(imagesDir, fileName), Buffer.from(buffer));
        }
    }
}
exports.TmdbHttpPeopleProvider = TmdbHttpPeopleProvider;

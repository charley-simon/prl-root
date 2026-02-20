"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TmdbJsonProvider = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const Movie_1 = require("../../domain/movie/Movie");
class TmdbJsonProvider {
    name() {
        return "TMDB_JSON_MOCK";
    }
    async fetchById(id) {
        const FileUrl = new URL("./tmdb-mock.json", import.meta.url);
        const raw = await promises_1.default.readFile(FileUrl, "utf-8");
        const data = JSON.parse(raw);
        if (data.id !== id)
            return null;
        return new Movie_1.Movie(data.id, data.title, data.overview);
    }
}
exports.TmdbJsonProvider = TmdbJsonProvider;

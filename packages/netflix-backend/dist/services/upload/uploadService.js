"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class UploadService {
    constructor(uploadDir, moviesById) {
        this.uploadDir = uploadDir;
        this.moviesById = moviesById;
    }
    async uploadMovieFile(file, metadata) {
        // 1️⃣ Générer ID unique
        const newId = Math.max(...Object.keys(this.moviesById).map(k => Number(k))) + 1;
        // 2️⃣ Copier le fichier
        const targetPath = path_1.default.join(this.uploadDir, `${newId}-${file.name}`);
        fs_1.default.writeFileSync(targetPath, file.buffer);
        // 3️⃣ Créer movie minimal
        const newMovie = {
            id: newId,
            title: metadata.title ?? file.name,
            releaseYear: metadata.releaseYear ?? new Date().getFullYear(),
            categories: metadata.categories ?? [],
            rating: metadata.rating ?? 0,
            isLocal: true
        };
        // 4️⃣ Ajouter au cache
        this.moviesById[newId] = newMovie;
        return newMovie;
    }
}
exports.UploadService = UploadService;

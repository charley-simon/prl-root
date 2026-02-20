"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar_1 = __importDefault(require("chokidar"));
const watcher = chokidar_1.default.watch("./video-import", { ignoreInitial: false });
watcher.on("add", async (path) => {
    console.log(`Fichier détecté: ${path}`);
    const filename = path.split("/").pop();
    const { title, year } = parseFilename(filename);
    const movie = await searchTMDB(title, year);
    if (movie) {
        console.log(`Film trouvé: ${movie.title} (${movie.releaseYear}) TMDB ID: ${movie.tmdbId}`);
        // créer/update {tmdbId}-movie.json
    }
    else {
        console.warn(`Aucun film trouvé pour: ${title} (${year})`);
    }
});

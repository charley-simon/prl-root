"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
async function searchTMDB(title, year) {
    const apiKey = process.env.TMDB_API_KEY;
    const url = new URL('https://api.themoviedb.org/3/search/movie');
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('query', title);
    if (year)
        url.searchParams.set('year', year.toString());
    const res = await (0, node_fetch_1.default)(url.toString());
    const data = await res.json();
    // retourne le meilleur match
    if (data.results && data.results.length > 0) {
        const movie = data.results[0];
        return {
            tmdbId: movie.id,
            title: movie.title,
            releaseYear: Number(movie.release_date?.slice(0, 4)),
            overview: movie.overview
        };
    }
    return null;
}
// test
;
(async () => {
    const { title, year } = parseFilename('Dark.Phoenix.2019.MULTi.TRUEFRENCH.1080p.HDLight.x264.AC3-EXTREME.mkv');
    const movie = await searchTMDB(title, year);
    console.log(movie);
})();
/** Doit nous générer :
 * {
  "id": 4001,
  "title": "Dark Phoenix",
  "releaseYear": 2019,
  "tmdbId": 4001,
  "video": {
    "localPath": "./video-import/Dark.Phoenix.2019.MULTi.TRUEFRENCH.1080p.HDLight.x264.AC3-EXTREME.mkv"
  }
}

 */

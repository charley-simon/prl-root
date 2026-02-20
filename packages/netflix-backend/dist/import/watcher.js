"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Surveillance du répertoire /video-import
 * - Parsing automatique des noms de fichiers pour extraire title + year
 * - Recherche TMDB pour récupérer tmdbId et infos de base
 * - Création / mise à jour de {id}-movie.json minimal
 * - récupère automatiquement les images TMDB (posterSm/Md/Lg, backgroundMd/Lg)
 * - conversion automatique en .avif Sm/Md/Lg via Sharp
 * - Ajout du chemin local et métadonnées vidéo
 * - Préparation pour enrichissement lazy (Wikipedia/Wikidata)
 * - Gestion des cas local / streaming / providers / unknown
 *
 * ✅ Fonctionnalités incluses
 * - Parse automatique du nom de fichier
 *   - Gère points, espaces, crochets, release groups
 *   - Extrait l’année si présente
 * - Recherche TMDB
 *   - Si plusieurs résultats, prend le premier → à améliorer si nécessaire
 * - JSON minimal {tmdbId}-movie.json
 *   - Stocke title, releaseYear, overview, video.localPath, provider
 *   - Merge si le fichier existe déjà
 * - Répertoire surveillé en temps réel (video-import)
 *   - Détecte nouveaux fichiers automatiquement
 * - Extensible pour enrichissement lazy
 *   - overview et autres champs peuvent être complétés par ton worker d’enrichissement Wikidata/Wikipedia plus tard
 * - Support futur pour multi-providers
 *   - provider: "local" → on peut étendre vers "youtube", "netflix", "prime", "unknown"
 * 💡 Tu peux maintenant déposer n’importe quelle vidéo locale, et le worker :
 * - créera automatiquement le MovieDetail
 * - liera la vidéo au film
 * - prépare le terrain pour le lazy enrichissement et la visualisation côté backend/frontend
 *
 * ✅ Points forts de cette version
 * - Conversion automatique en .avif pour toutes les tailles (Sm/Md/Lg)
 * - Lazy enrichment prêt : overview, biographie, Wikidata/Wikipedia peuvent être complétés après
 * - Provider “local” prêt pour test avec vidéos locales
 * - Merge automatique pour ne jamais écraser les données existantes
 * - Support complet pour noms de fichiers variés (points, espaces, crochets, release group, année facultative)
 */
const chokidar_1 = __importDefault(require("chokidar"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const p_queue_1 = __importDefault(require("p-queue"));
// -----------------------------
// CONFIGURATION
// -----------------------------
const CONFIG_PATH = './config.json';
let config = {};
function loadConfig() {
    if (!fs_1.default.existsSync(CONFIG_PATH))
        return {};
    const newConfig = JSON.parse(fs_1.default.readFileSync(CONFIG_PATH, 'utf-8'));
    // Surcharge process.env
    if (newConfig.env && typeof newConfig.env === 'object') {
        for (const [key, value] of Object.entries(newConfig.env)) {
            process.env[key] = value;
        }
    }
    return newConfig;
}
config = loadConfig();
// Watcher pour recharger la config
chokidar_1.default.watch(CONFIG_PATH, { ignoreInitial: true }).on('change', () => {
    console.log('[CONFIG] Changement détecté, rechargement...');
    config = loadConfig();
    console.log('[CONFIG] Config rechargé');
});
// -----------------------------
// Paths et paramètres dynamiques
// -----------------------------
function getPaths() {
    return {
        VIDEO_DIR: config.paths?.videoImport || './video-import',
        DATA_DIR: config.paths?.movieData || './data/movies',
        ASSETS_DIR: config.paths?.assets || './data/assets/movies'
    };
}
function getWorkerParams() {
    return {
        MAX_DOWNLOADS: config.worker?.maxConcurrentDownloads || 3,
        LAZY_ENRICHMENT: config.worker?.lazyEnrichment ?? true
    };
}
// Créer dossiers si nécessaire
function ensureDirs() {
    const { DATA_DIR, ASSETS_DIR } = getPaths();
    [DATA_DIR, ASSETS_DIR].forEach(dir => {
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
    });
}
ensureDirs();
// -----------------------------
// Utils
// -----------------------------
function parseVideoFilename(filename) {
    let name = filename.replace(/\.[^.]+$/, '');
    name = name.replace(/\[(.*?)\]/g, '');
    name = name.replace(/\b(1080p|720p|BluRay|WEB-DL|HDLight|x264|AC3|MULTi|EXTREME|STVFRV|Pop)\b/gi, '');
    name = name.replace(/[._]+/g, ' ').trim();
    const yearMatch = name.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? parseInt(yearMatch[0]) : null;
    const title = name.replace(yearMatch?.[0] ?? '', '').trim();
    return { title, year };
}
async function searchTMDB(title, year) {
    const url = new URL('https://api.themoviedb.org/3/search/movie');
    url.searchParams.set('api_key', process.env.TMDB_API_KEY || '');
    url.searchParams.set('query', title);
    if (year !== undefined)
        url.searchParams.set('year', year.toString());
    const res = await (0, node_fetch_1.default)(url.toString());
    const data = (await res.json());
    if (data.results && data.results.length > 0) {
        const movie = data.results[0];
        return {
            tmdbId: movie.id,
            title: movie.title,
            releaseYear: Number(movie.release_date?.slice(0, 4)),
            overview: movie.overview,
            posterPath: movie.poster_path,
            backdropPath: movie.backdrop_path
        };
    }
    return null;
}
async function fetchExternalIDs(tmdbId) {
    const url = `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${process.env.TMDB_API_KEY}`;
    const res = await (0, node_fetch_1.default)(url);
    if (!res.ok)
        return {};
    const data = (await res.json());
    return {
        imdbId: data.imdb_id,
        wikidataId: data.wikidata_id
    };
}
async function fetchWikiDescription(wikidataId) {
    if (!wikidataId)
        return '';
    const query = `
    SELECT ?description WHERE {
      wd:${wikidataId} schema:description ?description.
      FILTER(LANG(?description) = "fr")
    }`;
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
    const res = await (0, node_fetch_1.default)(url, { headers: { Accept: 'application/sparql-results+json' } });
    if (!res.ok)
        return '';
    const data = (await res.json());
    const desc = data.results?.bindings?.[0]?.description?.value ?? '';
    return desc;
}
async function downloadAndConvertTMDBImage(tmdbPath, baseName, widths, ASSETS_DIR) {
    if (!tmdbPath)
        return {};
    const url = `https://image.tmdb.org/t/p/original${tmdbPath}`;
    const res = await (0, node_fetch_1.default)(url.toString());
    if (!res.ok)
        return {};
    const buffer = Buffer.from(await res.arrayBuffer());
    const result = {};
    for (const w of widths) {
        const suffix = w <= 150 ? 'Sm' : w <= 500 ? 'Md' : 'Lg';
        const filePath = path_1.default.join(ASSETS_DIR, `${baseName}${suffix}.avif`);
        if (!fs_1.default.existsSync(filePath)) {
            await (0, sharp_1.default)(buffer).resize({ width: w }).avif({ quality: 80 }).toFile(filePath);
            console.log(`[IMAGE] ${filePath} créé`);
        }
        result[suffix] = filePath;
    }
    return result;
}
// -----------------------------
// Worker : traitement d'un fichier vidéo
// -----------------------------
async function handleVideoFile(filepath) {
    const filename = path_1.default.basename(filepath);
    const { title, year } = parseVideoFilename(filename);
    console.log(`Fichier détecté: ${filename} -> title: "${title}", year: ${year}`);
    const movie = await searchTMDB(title, year ?? undefined);
    if (!movie) {
        console.warn(`Aucun film trouvé pour: "${title}" (${year ?? 'unknown'})`);
        return;
    }
    console.log(`Film trouvé TMDB ID: ${movie.tmdbId}, title: "${movie.title}"`);
    const { DATA_DIR, ASSETS_DIR } = getPaths();
    const movieJsonPath = path_1.default.join(DATA_DIR, `${movie.tmdbId}-movie.json`);
    let movieData = {};
    if (fs_1.default.existsSync(movieJsonPath)) {
        movieData = JSON.parse(fs_1.default.readFileSync(movieJsonPath, 'utf-8'));
    }
    movieData.id = movie.tmdbId;
    movieData.title = movie.title;
    movieData.releaseYear = movieData.releaseYear ?? movie.releaseYear ?? year;
    movieData.overview = movieData.overview ?? movie.overview ?? '';
    movieData.video = movieData.video ?? { localPath: path_1.default.resolve(filepath), provider: 'local' };
    // Poster
    if (!movieData.posterSm || !movieData.posterMd || !movieData.posterLg) {
        if (movie.posterPath) {
            const posterFiles = await downloadAndConvertTMDBImage(movie.posterPath, `${movie.tmdbId}-poster`, [100, 300, 500], ASSETS_DIR);
            movieData.posterSm = movieData.posterSm || posterFiles.Sm || '';
            movieData.posterMd = movieData.posterMd || posterFiles.Md || '';
            movieData.posterLg = movieData.posterLg || posterFiles.Lg || '';
        }
    }
    // Backdrop
    if (!movieData.backgroundMd || !movieData.backgroundLg) {
        if (movie.backdropPath) {
            const backdropFiles = await downloadAndConvertTMDBImage(movie.backdropPath, `${movie.tmdbId}-background`, [300, 1000], ASSETS_DIR);
            movieData.backgroundMd = movieData.backgroundMd || backdropFiles.Sm || '';
            movieData.backgroundLg = movieData.backgroundLg || backdropFiles.Lg || '';
        }
    }
    // Enrichissement IDs externes
    const externalIDs = await fetchExternalIDs(movie.tmdbId);
    movieData.imdbId = movieData.imdbId || externalIDs.imdbId;
    movieData.wikidataId = movieData.wikidataId || externalIDs.wikidataId;
    // Enrichissement narratif depuis Wikidata
    if (movieData.wikidataId && !movieData.wikiDescription) {
        movieData.wikiDescription = await fetchWikiDescription(movieData.wikidataId);
    }
    fs_1.default.writeFileSync(movieJsonPath, JSON.stringify(movieData, null, 2), 'utf-8');
    console.log(`[JSON] Movie JSON mis à jour: ${movieJsonPath}`);
}
// -----------------------------
// File queue avec concurrence
// -----------------------------
const workerParams = getWorkerParams();
const queue = new p_queue_1.default({ concurrency: workerParams.MAX_DOWNLOADS });
let processedCount = 0;
function enqueueVideo(filePath) {
    queue.add(async () => {
        await handleVideoFile(filePath);
        processedCount++;
    });
}
// -----------------------------
// Surveillance répertoire vidéo
// -----------------------------
function startWatcher() {
    const { VIDEO_DIR } = getPaths();
    const watcher = chokidar_1.default.watch(VIDEO_DIR, { ignoreInitial: false });
    watcher.on('add', filePath => {
        console.log(`[WATCHER] Nouveau fichier détecté: ${filePath}`);
        enqueueVideo(filePath);
    });
    console.log(`[WORKER] Surveillance du répertoire: ${VIDEO_DIR} avec queue de ${workerParams.MAX_DOWNLOADS} fichiers concurrents`);
}
startWatcher();
// -----------------------------
// Monitoring live de la queue
// -----------------------------
function startMonitoring(intervalMs = 2000) {
    setInterval(() => {
        console.clear();
        console.log('===== WORKER STATUS =====');
        console.log(`Fichiers en attente   : ${queue.size}`);
        console.log(`Fichiers en cours     : ${queue.pending}`);
        console.log(`Fichiers traités      : ${processedCount}`);
        console.log('=========================');
    }, intervalMs);
}
startMonitoring();

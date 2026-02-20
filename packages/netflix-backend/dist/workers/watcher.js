"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWatcher = startWatcher;
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const tmdbUtils_1 = require("../providers/tmdbUtils");
const WATCH_DIR = path_1.default.resolve('./incoming');
// extensions autorisées
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov'];
// fichiers déjà traités (évite double trigger)
const processed = new Set();
function isVideoFile(file) {
    return VIDEO_EXTENSIONS.includes(path_1.default.extname(file).toLowerCase());
}
// attendre que le fichier soit complètement copié
async function waitForFileReady(filepath, timeout = 10000) {
    const start = Date.now();
    while (true) {
        try {
            const size1 = fs_1.default.statSync(filepath).size;
            await new Promise(r => setTimeout(r, 500));
            const size2 = fs_1.default.statSync(filepath).size;
            if (size1 === size2)
                return;
        }
        catch {
            // fichier encore indisponible
        }
        if (Date.now() - start > timeout) {
            throw new Error('Timeout attente fichier prêt');
        }
    }
}
function startWatcher() {
    console.log(`👀 Surveillance dossier: ${WATCH_DIR}`);
    const watcher = chokidar_1.default.watch(WATCH_DIR, {
        ignoreInitial: true,
        persistent: true,
        depth: 0
    });
    watcher.on('add', async (filepath) => {
        if (!isVideoFile(filepath))
            return;
        if (processed.has(filepath))
            return;
        processed.add(filepath);
        console.log(`📥 Nouveau fichier détecté: ${path_1.default.basename(filepath)}`);
        try {
            await waitForFileReady(filepath);
            console.log('📦 Fichier prêt, traitement en cours...');
            await (0, tmdbUtils_1.handleVideoFile)(filepath);
            console.log('✅ Traitement terminé');
        }
        catch (err) {
            console.error('❌ Erreur traitement fichier:', err);
        }
    });
    watcher.on('error', error => {
        console.error('Watcher error:', error);
    });
    return watcher;
}

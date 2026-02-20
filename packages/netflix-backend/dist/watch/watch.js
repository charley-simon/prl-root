"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWatcher = startWatcher;
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const importQueue_1 = require("../workers/importQueue");
const logger_1 = require("../utils/logger");
const config_1 = __importDefault(require("../config"));
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov'];
function isVideoFile(filePath) {
    return VIDEO_EXTENSIONS.includes(path_1.default.extname(filePath).toLowerCase());
}
function startWatcher() {
    const watchPath = config_1.default.paths.videoImport;
    logger_1.logger.info(`👀 Watching folder: ${watchPath}`);
    const watcher = chokidar_1.default.watch(watchPath, {
        persistent: true,
        ignoreInitial: true,
        depth: 0
    });
    watcher.on('add', async (filePath) => {
        if (!isVideoFile(filePath)) {
            logger_1.logger.debug(`Ignored non-video file: ${filePath}`);
            return;
        }
        logger_1.logger.info(`📥 New video detected: ${filePath}`);
        try {
            await (0, importQueue_1.enqueueImport)(filePath);
        }
        catch (err) {
            logger_1.logger.error('Import enqueue failed', err);
        }
    });
    watcher.on('error', error => {
        logger_1.logger.error('Watcher error', error);
    });
    return watcher;
}

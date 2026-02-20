"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Worker = void 0;
// src/workers/worker.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const metricsRegistry_1 = require("../services/monitoring/metricsRegistry");
const DATA_DIR = path_1.default.resolve('./data/movies');
const metricsRegistry = new metricsRegistry_1.MetricsRegistry();
class Worker {
    constructor(providers) {
        this.providers = providers;
    }
    async process(movie) {
        const startTime = Date.now();
        try {
            for (const provider of this.providers) {
                await provider.enrich(movie);
            }
            // Sauvegarde JSON sur disque
            const movieJsonPath = path_1.default.join(DATA_DIR, `${movie.id}-movie.json`);
            fs_1.default.writeFileSync(movieJsonPath, JSON.stringify(movie, null, 2), 'utf-8');
            // Metrics
            const duration = Date.now() - startTime;
            metricsRegistry.histogram('worker.process.duration').record(duration);
            return movie;
        }
        catch (err) {
            metricsRegistry.counter('worker.process.failed').inc();
            throw err;
        }
    }
}
exports.Worker = Worker;
/**
import { Worker } from './workers/worker'
import { TMDBProvider } from './workers/providers/tmdbProvider'
import { WikipediaProvider } from './workers/providers/wikipediaProvider'
import { MovieServiceImpl } from './services/movie/movieService'

const movieService = new MovieServiceImpl()
const providers = [new TMDBProvider(), new WikipediaProvider()]
const worker = new Worker(providers)

async function run() {
  const movie = await movieService.getMovieDetailById(320288)
  await worker.process(movie)
}

run()
 */

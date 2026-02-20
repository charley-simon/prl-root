"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieServiceImpl = void 0;
// src/services/movie/movieService.ts
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const movieEvents_1 = require("../../services/movie/movieEvents");
class MovieServiceImpl {
    constructor() {
        this.movies = [];
        this.people = [];
        this.jobs = [];
        this.moviesPeople = [];
        this.jobsById = {};
        this.jobsByName = {};
        this.peopleById = {};
        this.moviesById = {};
        this.moviesPeopleByJob = {};
        this.loadReferences();
        // ✅ S'abonner aux événements movie-updated
        movieEvents_1.movieEvents.on('movie-updated', (payload) => {
            this.reloadMovie(payload.filePath);
            console.log(`MovieService: cache mis à jour pour movieId=${payload.id}`);
        });
    }
    // Méthode pour recharger un film depuis son JSON
    reloadMovie(movieFilePath) {
        const movieData = JSON.parse(fs_1.default.readFileSync(movieFilePath, 'utf-8'));
        this.moviesById[movieData.id] = movieData;
        const idx = this.movies.findIndex(m => m.id === movieData.id);
        if (idx >= 0)
            this.movies[idx] = movieData;
        else
            this.movies.push(movieData);
    }
    loadReferences() {
        const refsPath = path_1.default.join(__dirname, '../../../data/references');
        const peoplePath = path_1.default.join(__dirname, '../../../data/people.json');
        const moviesPath = path_1.default.join(__dirname, '../../../data/movies.json');
        const moviesPeoplePath = path_1.default.join(__dirname, '../../../data/movies-people.json');
        // Chargement JSON
        this.jobs = JSON.parse(fs_1.default.readFileSync(path_1.default.join(refsPath, 'jobs.json'), 'utf-8'));
        this.people = JSON.parse(fs_1.default.readFileSync(peoplePath, 'utf-8'));
        this.movies = JSON.parse(fs_1.default.readFileSync(moviesPath, 'utf-8'));
        this.moviesPeople = JSON.parse(fs_1.default.readFileSync(moviesPeoplePath, 'utf-8'));
        // Création caches rapides
        this.jobs.forEach(j => {
            this.jobsById[j.id] = j;
            this.jobsByName[j.name] = j;
        });
        this.people.forEach(p => {
            this.peopleById[p.id] = p;
        });
        this.movies.forEach(m => {
            this.moviesById[m.id] = m;
        });
    }
    // ✅ Correction TypeScript: kind peut être undefined
    validateJob(kind) {
        if (kind && !this.jobsByName[kind]) {
            console.log(`Job inconnu: ${kind}`);
            throw new Error(`Job inconnu: ${kind}`);
        }
    }
    async getMovieDetailById(movieId) {
        const movie = this.moviesById[movieId];
        if (!movie)
            throw new Error(`Movie ${movieId} not found`);
        return movie;
    }
    async getPersonDetailById(personId) {
        const person = this.peopleById[personId];
        if (!person)
            throw new Error(`Person ${personId} not found`);
        return person;
    }
    // Lazy cache pour filtrer par job
    getLinksByJob(kind) {
        if (!kind)
            return this.moviesPeople;
        if (!this.moviesPeopleByJob[kind]) {
            const job = this.jobsByName[kind];
            if (!job)
                throw new Error(`Job inconnu: ${kind}`);
            this.moviesPeopleByJob[kind] = this.moviesPeople.filter(mp => mp.jobId === job.id);
        }
        return this.moviesPeopleByJob[kind];
    }
    async getPeopleFromMovie(movieId, kind) {
        this.validateJob(kind);
        const links = this.getLinksByJob(kind).filter(mp => mp.movieId === movieId);
        return links.map(link => this.peopleById[link.personId]);
    }
    async getMoviesFromPerson(personId, kind) {
        this.validateJob(kind);
        const links = this.getLinksByJob(kind).filter(mp => mp.personId === personId);
        return links.map(link => this.moviesById[link.movieId]);
    }
    async getPeopleFromPerson(personId, kind) {
        this.validateJob(kind);
        const links = this.getLinksByJob(kind).filter(mp => mp.personId === personId);
        return links.map(link => this.peopleById[link.personId]);
    }
    async listMovies(batch) {
        const offset = batch?.offset ?? 0;
        const limit = batch?.limit ?? 50;
        const allMovies = Object.values(this.moviesById);
        return allMovies.slice(offset, offset + limit);
    }
    async getSimilarMovies(movieId) {
        const movie = this.moviesById[movieId];
        if (!movie)
            throw new Error(`Movie ${movieId} not found`);
        const categories = new Set(movie.categories);
        const similar = this.movies.filter(m => m.id !== movieId && m.categories?.some(cat => categories.has(cat)));
        return similar.slice(0, 5);
    }
    /**
     * Retourne une liste personnalisée selon les préférences utilisateur
     * @param prefs - préférences utilisateur
     * @param batch - offset/limit pour lazy loading
     */
    async listPersonalizedMovies(prefs, batch) {
        const start = performance.now();
        // 1️⃣ Filtrage catégories
        let filtered = this.movies.filter(movie => !prefs.favoriteCategories.length ||
            movie.categories.some(cat => prefs.favoriteCategories.includes(cat)));
        // 2️⃣ Filtrage année minimale
        if (prefs.minYear) {
            if (prefs.minYear !== undefined && prefs.minYear !== null) {
                filtered = filtered.filter(movie => movie.releaseYear >= prefs.minYear);
            }
        }
        // 3️⃣ Tri selon sortBy / sortOrder
        const sortBy = prefs.sortBy ?? 'rating';
        const sortOrder = prefs.sortOrder ?? 'desc';
        filtered.sort((a, b) => {
            let diff = 0;
            if (sortBy === 'rating')
                diff = (b.rating ?? 0) - (a.rating ?? 0);
            if (sortBy === 'year')
                diff = (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
            if (sortBy === 'title')
                diff = a.title.localeCompare(b.title);
            return sortOrder === 'asc' ? -diff : diff;
        });
        // 4️⃣ Lazy loading
        const offset = batch?.offset ?? 0;
        const limit = batch?.limit ?? 20;
        filtered = filtered.slice(offset, offset + limit);
        // 5️⃣ Log métriques
        const duration = performance.now() - start;
        console.log(`[UC5] Personalized list: ${filtered.length} movies, ${duration.toFixed(2)} ms`);
        return filtered;
    }
    // Optionnel : libérer le tableau source si tous les caches ont été créés
    freeMoviesPeopleSource() {
        this.moviesPeople = [];
    }
}
exports.MovieServiceImpl = MovieServiceImpl;

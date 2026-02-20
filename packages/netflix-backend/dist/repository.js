"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dataPath = path_1.default.join(__dirname, "../data");
function readJSON(fileName) {
    return JSON.parse(fs_1.default.readFileSync(path_1.default.join(dataPath, fileName), "utf-8"));
}
class Repository {
    constructor() {
        this.movies = readJSON("movies.json");
        this.people = readJSON("people.json");
        this.moviePeople = readJSON("movie_people.json");
        this.references = readJSON("reference.json");
    }
    getMovies() {
        return this.movies;
    }
    getMovieById(id) {
        const movie = this.movies.find((m) => m.id == id);
        console.log(`getMovieById(${id}) => ${movie ? movie.title : "not found"}`);
        return movie;
    }
    getPeople() {
        return this.people;
    }
    getPersonById(id) {
        return this.people.find((p) => p.id == id);
    }
    getReferences() {
        return this.references;
    }
    getPeoples(filters = {}) {
        let result = this.moviePeople;
        if (filters.movieId) {
            result = result.filter((mp) => mp.movieId == filters.movieId);
        }
        if (filters.roles) {
            const roleIds = this.references.jobs
                .filter((j) => filters.roles?.includes(j.name))
                .map((j) => j.id);
            result = result.filter((mp) => roleIds.includes(mp.jobId));
        }
        if (filters.departments) {
            const deptIds = this.references.departments
                .filter((d) => filters.departments?.includes(d.name))
                .map((d) => d.id);
            result = result.filter((mp) => deptIds.includes(mp.departmentId));
        }
        if (filters.genderId) {
            result = result.filter((mp) => {
                const person = this.people.find((p) => p.id == mp.peopleId);
                return person?.genderId == filters.genderId;
            });
        }
        // Retourne objets détaillés people + role + department + characterName
        return result.map((mp) => {
            const person = this.people.find((p) => p.id == mp.peopleId);
            const job = this.references.jobs.find((j) => j.id == mp.jobId);
            const department = this.references.departments.find((d) => d.id == mp.departmentId);
            return {
                ...person,
                role: job?.name,
                department: department?.name,
                characterName: mp.characterName,
            };
        });
    }
    getActors(movieId) {
        return this.getPeoples({ movieId, roles: ["Actor"] });
    }
    getDirectors(movieId) {
        return this.getPeoples({ movieId, roles: ["Director"] });
    }
}
exports.Repository = Repository;

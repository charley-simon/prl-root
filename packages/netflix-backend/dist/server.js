"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const repository_1 = require("./repository");
const fastify = (0, fastify_1.default)({
    logger: true,
    ajv: {
        customOptions: {
            coerceTypes: true, // 🔥 transforme "12" → 12
        },
    },
});
fastify.register(cors_1.default, {
    origin: [
        "http://localhost:5173", // frontend Vite
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});
const repo = new repository_1.Repository();
// --------------------
// Movies endpoints
// --------------------
// GET /movies - liste tous les films
fastify.get("/movies", async (request, reply) => {
    return repo.getMovies();
});
// GET /movies/:id - film unique
fastify.get("/movies/:id", async (request, reply) => {
    const { id } = request.params; // ← number 🎉
    const movie = repo.getMovieById(id);
    console.log("Requested movie ID:", id, movie);
    if (!movie) {
        reply.status(404);
        throw new Error(`Movie(${id}) not found`);
    }
    return movie;
});
// GET /movies/:id/actors - acteurs
fastify.get("/movies/:id/actors", async (request, reply) => {
    const { id } = request.params; // ← number 🎉
    const movie = repo.getMovieById(id);
    if (!movie) {
        reply.status(404);
        throw new Error(`Movie(${id}) not found`);
    }
    return repo.getActors(id);
});
// GET /movies/:id/directors - réalisateurs
fastify.get("/movies/:id/directors", async (request, reply) => {
    const { id } = request.params; // ← number 🎉
    const movie = repo.getMovieById(id);
    if (!movie) {
        reply.status(404);
        throw new Error(`Movie(${id}) not found`);
    }
    return repo.getDirectors(id);
});
// GET /movies/:id/crew - tout le crew
fastify.get("/movies/:id/crew", async (request, reply) => {
    const { id } = request.params; // ← number 🎉
    const movie = repo.getMovieById(id);
    if (!movie) {
        reply.status(404);
        throw new Error(`Movie(${id}) not found`);
    }
    return repo.getPeoples({ movieId: id });
});
// --------------------
// People endpoints
// --------------------
// GET /people - liste toutes les personnes
fastify.get("/people", async () => repo.getPeople());
// GET /people/:id - personne unique
fastify.get("/people/:id", async (request, reply) => {
    const { id } = request.params; // ← number 🎉
    const person = repo.getPersonById(id);
    if (!person) {
        reply.status(404);
        throw new Error(`Person(${id}) not found`);
    }
    return person;
});
// GET /people/:id/movies - filmographie + rôle // A FINR EN UTILISANT
fastify.get("/people/:id/movies", async (request, reply) => {
    const { id } = request.params; // ← number 🎉
    const person = repo.getPersonById(id);
    console.log(`getMoviesForPerson ${id}, ${person?.name}`);
    if (!person) {
        reply.status(404);
        throw new Error(`Person(${id}) not found`);
    }
    const movies = repo.moviePeople
        .filter((mp) => mp.peopleId == id)
        .map((mp) => {
        const movie = repo.getMovieById(mp.movieId);
        const role = repo.references.jobs.find((j) => j.id == mp.jobId)?.name;
        const department = repo.references.departments.find((d) => d.id == mp.departmentId)?.name;
        console.log(`Mapping movieId ${mp.movieId}, ${movie?.title} for peopleId ${id}`);
        return { movie, role, department, characterName: mp.characterName };
    });
    return movies;
});
// --------------------
// References endpoint
// --------------------
fastify.get("/references", async () => repo.getReferences());
// --------------------
// Start server
// --------------------
const start = async () => {
    try {
        await fastify.listen({ port: 3000 });
        console.log("Server running at http://localhost:3000");
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();

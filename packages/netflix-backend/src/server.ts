import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import { Repository } from "./repository";

const fastify = Fastify({
  logger: true,
  ajv: {
    customOptions: {
      coerceTypes: true, // 🔥 transforme "12" → 12
    },
  },
});

fastify.register(cors, {
  origin: [
    "http://localhost:5173", // frontend Vite
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

const repo = new Repository();

// --------------------
// Movies endpoints
// --------------------

// GET /movies - liste tous les films
fastify.get("/movies", async (request, reply) => {
  return repo.getMovies();
});

// GET /movies/:id - film unique
fastify.get<{ Params: { id: number } }>(
  "/movies/:id",
  async (
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply,
  ) => {
    const { id } = request.params; // ← number 🎉
    const movie = repo.getMovieById(id);
    console.log("Requested movie ID:", id, movie);
    if (!movie) {
      reply.status(404);
      throw new Error(`Movie(${id}) not found`);
    }
    return movie;
  },
);

// GET /movies/:id/actors - acteurs
fastify.get<{ Params: { id: number } }>(
  "/movies/:id/actors",
  async (
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply,
  ) => {
    const { id } = request.params; // ← number 🎉
    const movie = repo.getMovieById(id);
    if (!movie) {
      reply.status(404);
      throw new Error(`Movie(${id}) not found`);
    }
    return repo.getActors(id);
  },
);

// GET /movies/:id/directors - réalisateurs
fastify.get<{ Params: { id: number } }>(
  "/movies/:id/directors",
  async (
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply,
  ) => {
    const { id } = request.params; // ← number 🎉
    const movie = repo.getMovieById(id);
    if (!movie) {
      reply.status(404);
      throw new Error(`Movie(${id}) not found`);
    }
    return repo.getDirectors(id);
  },
);

// GET /movies/:id/crew - tout le crew
fastify.get<{ Params: { id: number } }>(
  "/movies/:id/crew",
  async (
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply,
  ) => {
    const { id } = request.params; // ← number 🎉
    const movie = repo.getMovieById(id);
    if (!movie) {
      reply.status(404);
      throw new Error(`Movie(${id}) not found`);
    }
    return repo.getPeoples({ movieId: id });
  },
);

// --------------------
// People endpoints
// --------------------

// GET /people - liste toutes les personnes
fastify.get("/people", async () => repo.getPeople());

// GET /people/:id - personne unique
fastify.get<{ Params: { id: number } }>(
  "/people/:id",
  async (
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply,
  ) => {
    const { id } = request.params; // ← number 🎉
    const person = repo.getPersonById(id);
    if (!person) {
      reply.status(404);
      throw new Error(`Person(${id}) not found`);
    }
    return person;
  },
);

// GET /people/:id/movies - filmographie + rôle // A FINR EN UTILISANT
fastify.get<{ Params: { id: number } }>(
  "/people/:id/movies",
  async (
    request: FastifyRequest<{ Params: { id: number } }>,
    reply: FastifyReply,
  ) => {
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
        const role = repo.references.jobs.find(
          (j: any) => j.id == mp.jobId,
        )?.name;
        const department = repo.references.departments.find(
          (d: any) => d.id == mp.departmentId,
        )?.name;
        console.log(
          `Mapping movieId ${mp.movieId}, ${movie?.title} for peopleId ${id}`,
        );
        return { movie, role, department, characterName: mp.characterName };
      });

    return movies;
  },
);

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
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

Structure proposée
backend/
├─ data/
│  ├─ movies/
│  │  ├─ 120-movie.json
│  │  ├─ 121-movie.json
│  └─ assets/
│     ├─ 120-poster.avif      # version originale la plus grande
│     ├─ 120-background.avif
├─ src/
│  ├─ server.ts
│  ├─ movieService.ts
│  ├─ imageService.ts


movieService.ts → gestion des JSON {id}-movie.json et des listes (actors, directors…).

imageService.ts → génération lazy des posters/backdrops via Sharp.

Exemple de server.ts avec Fastify
import Fastify from "fastify";
import { getMovieDetail, getMovieList } from "./movieService";
import { getPoster, getBackdrop } from "./imageService";

const fastify = Fastify({ logger: true });
const PORT = 3000;

// Récupérer film complet ou sous-ressource
fastify.get("/movie/:id/:sub?", async (request, reply) => {
  const { id, sub } = request.params as { id: string; sub?: string };
  const movieId = parseInt(id);
  const movie = await getMovieDetail(movieId);
  if (!movie) return reply.status(404).send({ error: "Film introuvable" });

  if (!sub) return reply.send(movie);

  switch (sub.toLowerCase()) {
    case "actors":
      return reply.send(movie.actors || []);
    case "directors":
      return reply.send(movie.directors || []);
    case "writers":
      return reply.send(movie.writers || []);
    case "overview":
      return reply.send({ synopsis: movie.synopsis });
    case "poster":
      const size = (request.query as any).size || "medium";
      return getPoster(movieId, size).then(filePath => reply.sendFile(filePath));
    case "backdrop":
      const bsize = (request.query as any).size || "large";
      return getBackdrop(movieId, bsize).then(filePath => reply.sendFile(filePath));
    default:
      return reply.status(400).send({ error: "Sous-ressource inconnue" });
  }
});

// Lancer le serveur
fastify.listen({ port: PORT }, (err, address) => {
  if (err) throw err;
  console.log(`Server running at ${address}`);
});

Exemple de movieService.ts
import fs from "fs";
import path from "path";

const DATA_DIR = "./data/movies";

export async function getMovieDetail(id: number) {
  const filePath = path.join(DATA_DIR, `${id}-movie.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export async function getMovieList() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith("-movie.json"));
  return files.map(f => {
    const movie = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8"));
    return {
      id: movie.id,
      title: movie.title,
      releaseYear: movie.releaseYear,
      tagLine: movie.tagLine,
    };
  });
}

Exemple de imageService.ts (lazy generation avec Sharp)
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ASSETS_DIR = "./data/assets/movies";
const posterSizes = { small: 100, medium: 300, large: 500, extra: 1000 };
const backdropSizes = { medium: 300, large: 1000 };

export async function getPoster(movieId: number, size: keyof typeof posterSizes) {
  const orig = path.join(ASSETS_DIR, `${movieId}-poster.avif`);
  const out = path.join(ASSETS_DIR, `${movieId}-poster${size.charAt(0).toUpperCase()}.avif`);

  if (!fs.existsSync(orig)) throw new Error("Poster original introuvable");

  if (!fs.existsSync(out)) {
    await sharp(orig).resize({ width: posterSizes[size] }).toFile(out);
  }

  return out;
}

export async function getBackdrop(movieId: number, size: keyof typeof backdropSizes) {
  const orig = path.join(ASSETS_DIR, `${movieId}-background.avif`);
  const out = path.join(ASSETS_DIR, `${movieId}-background${size.charAt(0).toUpperCase()}.avif`);

  if (!fs.existsSync(orig)) throw new Error("Backdrop original introuvable");

  if (!fs.existsSync(out)) {
    await sharp(orig).resize({ width: backdropSizes[size] }).toFile(out);
  }

  return out;
}

✅ Points forts de ce blueprint

JSON léger et normalisé → pas de chemins stockés.

Posters/Backdrops lazy générés à la demande → économie d’espace et flexibilité.

REST standard → /movie/:id/:sub avec query size.

Extensible → rajouter writers, trailer, videos etc. facilement.

Compatible avec Worker et lazy loading.

Possibilité de cache mémoire ou disque pour les images générées fréquemment.
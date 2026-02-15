import { Movie } from "../../domain/movie/Movie";
import { MovieRepository } from "./MovieRepository";
import { InMemoryCache } from "../../../src/cache/InMemoryCache";
import { MetricsRegistry } from "../../instrumentation/MetricsRegistry";

/**
 * Repository InMemory utilisant InMemoryCache avec instrumentation
 */
export class InMemoryMovieRepository implements MovieRepository {
  private cache: InMemoryCache<string, Movie>;

  constructor() {
    this.cache = new InMemoryCache<string, Movie>(MetricsRegistry);
  }

  async findById(id: string): Promise<Movie | null> {
    return this.cache.get(id);
  }

  async save(movie: Movie): Promise<void> {
    this.cache.set(movie.id, movie);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

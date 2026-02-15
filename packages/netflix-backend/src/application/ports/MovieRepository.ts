import { Movie } from "../../domain/movie/Movie";

export interface MovieRepository {
  findById(id: string): Promise<Movie | null>;
  save(movie: Movie): Promise<void>;
}

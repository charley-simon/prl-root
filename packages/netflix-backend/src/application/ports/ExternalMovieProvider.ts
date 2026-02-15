import { Movie } from "../../domain/movie/Movie";

export interface ExternalMovieProvider {
  name(): string;
  fetchById(id: string): Promise<Movie | null>;
}

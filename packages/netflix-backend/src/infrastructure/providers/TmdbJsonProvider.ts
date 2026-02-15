import fs from "fs/promises";
import { ExternalMovieProvider } from "../../application/ports/ExternalMovieProvider";
import { Movie } from "../../domain/movie/Movie";

export class TmdbJsonProvider implements ExternalMovieProvider {
  name() {
    return "TMDB_JSON_MOCK";
  }

  async fetchById(id: string): Promise<Movie | null> {
    const FileUrl = new URL("./tmdb-mock.json", import.meta.url);
    const raw = await fs.readFile(FileUrl, "utf-8");
    const data = JSON.parse(raw);

    if (data.id !== id) return null;

    return new Movie(data.id, data.title, data.overview);
  }
}

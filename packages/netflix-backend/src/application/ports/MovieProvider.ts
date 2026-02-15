import { Movie } from "../../domain/movie/Movie";

/**
 * Port pour un fournisseur de films
 */
export interface MovieProvider {
  /**
   * Récupère un film par son ID
   * @param id identifiant du film
   * @returns Movie ou null si non trouvé
   */
  fetchById(id: string): Promise<Movie | null>;
}

/**
 * Exemple d'implémentation mock pour tests / dev
 */
export class MockMovieProvider implements MovieProvider {
  private data: Record<string, Movie>;

  constructor(data?: Record<string, Movie>) {
    this.data = data ?? {
      "1": { id: "1", title: "Mock Movie 1" } as Movie,
      "2": { id: "2", title: "Mock Movie 2" } as Movie,
    };
  }

  async fetchById(id: string): Promise<Movie | null> {
    // simulation d'accès externe avec léger délai
    await new Promise((r) => setTimeout(r, 5));
    return this.data[id] ?? null;
  }
}

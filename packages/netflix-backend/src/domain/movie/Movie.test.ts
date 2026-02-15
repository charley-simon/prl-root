import { describe, it, expect } from "vitest";
import { Movie } from "./Movie";

describe("Movie Domain", () => {
  it("should create a movie with proper fields", () => {
    const movie = new Movie("movie-123", "Interstellar", "A space adventure");
    expect(movie.id).toBe("movie-123");
    expect(movie.title).toBe("Interstellar");
    expect(movie.overview).toBe("A space adventure");
  });
});

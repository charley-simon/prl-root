"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Movie_1 = require("./Movie");
(0, vitest_1.describe)("Movie Domain", () => {
    (0, vitest_1.it)("should create a movie with proper fields", () => {
        const movie = new Movie_1.Movie("movie-123", "Interstellar", "A space adventure");
        (0, vitest_1.expect)(movie.id).toBe("movie-123");
        (0, vitest_1.expect)(movie.title).toBe("Interstellar");
        (0, vitest_1.expect)(movie.overview).toBe("A space adventure");
    });
});

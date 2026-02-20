"use strict";
/**
 * Represents a movie in the domain.
 *
 * Domain object:
 * - immutable
 * - persistence-agnostic
 * - transport-agnostic
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Movie = void 0;
class Movie {
    /**
     * @param id Unique identifier (internal or external)
     * @param title Display title
     * @param overview Optional summary
     */
    constructor(id, title, overview) {
        this.id = id;
        this.title = title;
        this.overview = overview;
    }
}
exports.Movie = Movie;

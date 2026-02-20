"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockMovieProvider = void 0;
/**
 * Exemple d'implémentation mock pour tests / dev
 */
class MockMovieProvider {
    constructor(data) {
        this.data = data ?? {
            "1": { id: "1", title: "Mock Movie 1" },
            "2": { id: "2", title: "Mock Movie 2" },
        };
    }
    async fetchById(id) {
        // simulation d'accès externe avec léger délai
        await new Promise((r) => setTimeout(r, 5));
        return this.data[id] ?? null;
    }
}
exports.MockMovieProvider = MockMovieProvider;

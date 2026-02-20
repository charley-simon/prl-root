"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WikipediaPersonProvider = exports.WikipediaMovieProvider = void 0;
const wikidataUtils_1 = require("./wikidataUtils");
class WikipediaMovieProvider {
    async enrich(movie) {
        if (movie.externalsIds?.wikidata) {
            movie.wikiDescription = await (0, wikidataUtils_1.fetchWikiDescription)(movie.externalsIds.wikidata);
        }
        return movie;
    }
}
exports.WikipediaMovieProvider = WikipediaMovieProvider;
class WikipediaPersonProvider {
    async enrich(person) {
        if (person.externalsIds?.wikidata) {
            person.wikiDescription = await (0, wikidataUtils_1.fetchWikiDescription)(person.externalsIds.wikidata);
        }
        return person;
    }
}
exports.WikipediaPersonProvider = WikipediaPersonProvider;

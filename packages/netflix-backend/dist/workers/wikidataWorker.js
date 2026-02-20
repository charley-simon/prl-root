"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWikiData = fetchWikiData;
// src/workers/wikidataWorker.ts
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Récupère des infos enrichies depuis Wikidata pour un film ou une personne
 * @param wikidataId Qxxxx
 * @param type 'movie' | 'person'
 */
async function fetchWikiData(wikidataId, type) {
    if (!wikidataId)
        return null;
    let query = '';
    if (type === 'movie') {
        query = `
    SELECT ?description ?genreLabel ?directorLabel ?castLabel WHERE {
      wd:${wikidataId} schema:description ?description.
      FILTER(LANG(?description) = "fr")

      OPTIONAL { wd:${wikidataId} wdt:P136 ?genre. }      # genre
      OPTIONAL { wd:${wikidataId} wdt:P57 ?director. }   # réalisateur
      OPTIONAL { wd:${wikidataId} wdt:P161 ?cast. }      # acteurs

      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
    }`;
    }
    else {
        query = `
    SELECT ?description ?filmLabel WHERE {
      wd:${wikidataId} schema:description ?description.
      FILTER(LANG(?description) = "fr")

      OPTIONAL { ?film wdt:P161|wdt:P57 wd:${wikidataId}. }  # films où la personne a joué ou dirigé

      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
    }`;
    }
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
    const res = await (0, node_fetch_1.default)(url, { headers: { Accept: 'application/sparql-results+json' } });
    if (!res.ok)
        return null;
    const data = (await res.json());
    const bindings = data.results?.bindings ?? [];
    if (type === 'movie') {
        const description = bindings[0]?.description?.value ?? '';
        const genres = Array.from(new Set(bindings.map((b) => b.genreLabel?.value).filter(Boolean)));
        const directors = Array.from(new Set(bindings.map((b) => b.directorLabel?.value).filter(Boolean)));
        const cast = Array.from(new Set(bindings.map((b) => b.castLabel?.value).filter(Boolean)));
        const result = { description, genres, directors, cast };
        return result;
    }
    else {
        const description = bindings[0]?.description?.value ?? '';
        const knownForFilms = Array.from(new Set(bindings.map((b) => b.filmLabel?.value).filter(Boolean)));
        const result = { description, knownForFilms };
        return result;
    }
}

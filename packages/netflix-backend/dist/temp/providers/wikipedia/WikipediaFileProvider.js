"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WikipediaFileProvider = void 0;
// src/providers/wikipedia/WikipediaFileProvider.ts
const BaseFileProvider_1 = require("../BaseFileProvider");
class WikipediaFileProvider extends BaseFileProvider_1.BaseFileProvider {
    constructor(basePath = './fixtures/wikipedia') {
        super(basePath);
        this.name = 'wikipedia';
    }
    async getMovieSummary(title, year) {
        const slug = title.toLowerCase().replace(/\s+/g, '_');
        return this.read(`/movies/${slug}.json`).catch(() => null);
    }
    async getPersonSummary(name) {
        const slug = name.toLowerCase().replace(/\s+/g, '_');
        return this.read(`/persons/${slug}.json`).catch(() => null);
    }
    async getPageById(pageId) {
        return this.read(`/pages/${pageId}.json`).catch(() => null);
    }
}
exports.WikipediaFileProvider = WikipediaFileProvider;

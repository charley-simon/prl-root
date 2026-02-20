"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WikipediaHttpProvider = void 0;
// src/providers/wikipedia/WikipediaHttpProvider.ts
const BaseHttpProvider_1 = require("../BaseHttpProvider");
class WikipediaHttpProvider extends BaseHttpProvider_1.BaseHttpProvider {
    constructor(lang = 'fr') {
        super(`https://${lang}.wikipedia.org/w`, ''); // pas de clé API
        this.lang = lang;
        this.name = 'wikipedia';
    }
    async getMovieSummary(title, year) {
        const query = year ? `${title} film ${year}` : `${title} film`;
        const pageId = await this.search(query);
        if (!pageId)
            return null;
        return this.getPageById(pageId);
    }
    async getPersonSummary(name) {
        const pageId = await this.search(name);
        if (!pageId)
            return null;
        return this.getPageById(pageId);
    }
    async getPageById(pageId) {
        const data = await this.get('/api.php', {
            action: 'query',
            pageids: pageId.toString(),
            prop: 'extracts|pageimages|info',
            exintro: '1',
            explaintext: '1',
            inprop: 'url',
            format: 'json',
            origin: '*'
        });
        const page = data.query.pages[pageId.toString()];
        if (!page || page.pageid === -1)
            return null;
        return page;
    }
    async search(query) {
        const data = await this.get('/api.php', {
            action: 'query',
            list: 'search',
            srsearch: query,
            srlimit: '1',
            format: 'json',
            origin: '*'
        });
        const results = data.query.search;
        if (!results.length)
            return null;
        return results[0].pageid;
    }
}
exports.WikipediaHttpProvider = WikipediaHttpProvider;

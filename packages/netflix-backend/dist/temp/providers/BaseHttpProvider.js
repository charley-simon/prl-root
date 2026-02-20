"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseHttpProvider = void 0;
const ProviderError_1 = require("./ProviderError");
class BaseHttpProvider {
    constructor(baseUrl, apiKey) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }
    // BaseHttpProvider.ts — version améliorée
    async get(endpoint, params) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        if (params) {
            Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
        }
        const headers = { 'Content-Type': 'application/json' };
        if (this.apiKey)
            headers['Authorization'] = `Bearer ${this.apiKey}`; // ← seulement si clé présente
        const response = await fetch(url.toString(), { headers });
        if (!response.ok)
            throw new ProviderError_1.ProviderError(this.name, response.status, url.toString());
        return response.json();
    }
}
exports.BaseHttpProvider = BaseHttpProvider;

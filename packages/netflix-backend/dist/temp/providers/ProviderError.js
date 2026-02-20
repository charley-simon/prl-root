"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderError = void 0;
// src/providers/ProviderError.ts
class ProviderError extends Error {
    constructor(providerName, statusCode, url) {
        super(`[${providerName}] HTTP ${statusCode} on ${url}`);
        this.providerName = providerName;
        this.statusCode = statusCode;
        this.url = url;
        this.name = 'ProviderError';
    }
}
exports.ProviderError = ProviderError;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeConfidence = computeConfidence;
function normalize(str) {
    return str
        .toLowerCase()
        .normalize('NFD') // retire accents
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
/**
 * Similarité entre deux chaînes (Jaccard simplifié)
 */
function titleSimilarity(a, b) {
    const setA = new Set(normalize(a).split(' '));
    const setB = new Set(normalize(b).split(' '));
    const intersection = [...setA].filter(x => setB.has(x)).length;
    const union = new Set([...setA, ...setB]).size;
    if (union === 0)
        return 0;
    return intersection / union;
}
function computeConfidence(fileTitle, tmdbTitle, fileYear, tmdbYear, popularity) {
    let score = 0;
    // 1️⃣ Similarité titre (max 0.7)
    const similarity = titleSimilarity(fileTitle, tmdbTitle);
    score += similarity * 0.7;
    // 2️⃣ Correspondance année (max 0.2)
    if (fileYear && tmdbYear) {
        const diff = Math.abs(fileYear - tmdbYear);
        if (diff === 0)
            score += 0.2;
        else if (diff === 1)
            score += 0.1;
    }
    // 3️⃣ Popularité TMDB (max 0.1)
    if (popularity) {
        const popScore = Math.min(popularity / 100, 1);
        score += popScore * 0.1;
    }
    return Math.min(score, 1);
}

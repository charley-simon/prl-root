"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePreferences = normalizePreferences;
function normalizePreferences(prefs) {
    return {
        favoriteCategories: prefs?.favoriteCategories ?? [],
        minYear: prefs?.minYear,
        sortBy: prefs?.sortBy ?? 'rating',
        sortOrder: prefs?.sortOrder ?? 'desc'
    };
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCache = void 0;
const userLoader_1 = require("./userLoader");
const defaultPreferences_1 = require("./defaultPreferences");
class UserCache {
    constructor(dataPath) {
        this.usersById = new Map();
        this.usersByName = new Map();
        const users = (0, userLoader_1.loadUsers)(dataPath);
        for (const user of users) {
            const normalized = this.normalize(user);
            this.usersById.set(normalized.id, normalized);
            this.usersByName.set(normalized.name, normalized);
        }
        console.log(`👥 Users loaded: ${users.length}`);
    }
    normalize(user) {
        return {
            ...user,
            preferences: this.normalizePreferences(user.preferences)
        };
    }
    normalizePreferences(prefs) {
        return {
            favoriteCategories: prefs?.favoriteCategories ?? [],
            minYear: prefs?.minYear,
            sortBy: prefs?.sortBy ?? defaultPreferences_1.DEFAULT_PREFERENCES.sortBy,
            sortOrder: prefs?.sortOrder ?? defaultPreferences_1.DEFAULT_PREFERENCES.sortOrder
        };
    }
    getById(id) {
        return this.usersById.get(id);
    }
    getByName(name) {
        return this.usersByName.get(name);
    }
    list() {
        return [...this.usersById.values()];
    }
}
exports.UserCache = UserCache;

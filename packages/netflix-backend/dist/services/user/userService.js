"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServiceImpl = void 0;
const defaultPreferences_1 = require("./defaultPreferences");
class UserServiceImpl {
    constructor(cache) {
        this.cache = cache;
    }
    async login(name, password) {
        const user = this.cache.getByName(name);
        if (!user || user.password !== password) {
            throw new Error('Invalid credentials');
        }
        return user;
    }
    async getUserById(id) {
        return this.cache.getById(id);
    }
    async getPreferences(userId) {
        const user = this.cache.getById(userId);
        if (!user)
            throw new Error('User not found');
        return user.preferences ?? defaultPreferences_1.DEFAULT_PREFERENCES;
    }
    async isAdmin(userId) {
        const user = this.cache.getById(userId);
        if (!user)
            return false;
        return user.isAdmin;
    }
}
exports.UserServiceImpl = UserServiceImpl;

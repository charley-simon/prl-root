"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const userCache_1 = require("../../../src/services/user/userCache");
const cache = new userCache_1.UserCache('./packages/netflix-backend/data');
(0, vitest_1.describe)('UserCache', () => {
    (0, vitest_1.it)('charge les utilisateurs', () => {
        (0, vitest_1.expect)(cache.list().length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('trouve un user par name', () => {
        const user = cache.getByName('alice');
        (0, vitest_1.expect)(user).toBeDefined();
    });
    (0, vitest_1.it)('normalise les préférences', () => {
        const user = cache.getByName('diane');
        (0, vitest_1.expect)(user).toBeDefined();
        if (user)
            (0, vitest_1.expect)(user.preferences).toBeDefined();
        if (user && user.preferences)
            (0, vitest_1.expect)(user?.preferences.favoriteCategories).toEqual([]);
    });
});

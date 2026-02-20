"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.UserPreferencesSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.UserPreferencesSchema = typebox_1.Type.Object({
    favoriteCategories: typebox_1.Type.Array(typebox_1.Type.Integer()),
    minYear: typebox_1.Type.Optional(typebox_1.Type.Integer()),
    sortBy: typebox_1.Type.Optional(typebox_1.Type.Union([typebox_1.Type.Literal('rating'), typebox_1.Type.Literal('year'), typebox_1.Type.Literal('title')])),
    sortOrder: typebox_1.Type.Optional(typebox_1.Type.Union([typebox_1.Type.Literal('asc'), typebox_1.Type.Literal('desc')]))
});
exports.UserSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Integer(),
    name: typebox_1.Type.String(),
    password: typebox_1.Type.String(),
    isAdmin: typebox_1.Type.Boolean(),
    preferences: typebox_1.Type.Optional(exports.UserPreferencesSchema)
});

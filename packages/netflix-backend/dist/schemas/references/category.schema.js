"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesSchema = exports.CategorySchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.CategorySchema = typebox_1.Type.Object({
    id: typebox_1.Type.Integer({ minimum: 1 }),
    name: typebox_1.Type.String({ minLength: 1 })
});
exports.CategoriesSchema = typebox_1.Type.Array(exports.CategorySchema);

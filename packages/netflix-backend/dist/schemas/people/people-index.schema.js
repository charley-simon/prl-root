"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeopleIndexSchema = exports.PeopleIndexItemSchema = exports.GenderSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.GenderSchema = typebox_1.Type.Union([
    typebox_1.Type.Literal(0), // Unknown
    typebox_1.Type.Literal(1), // Female
    typebox_1.Type.Literal(2) // Male
]);
exports.PeopleIndexItemSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Integer({ minimum: 1 }),
    gender: exports.GenderSchema,
    name: typebox_1.Type.String({ minLength: 1 })
});
exports.PeopleIndexSchema = typebox_1.Type.Array(exports.PeopleIndexItemSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitySchema = exports.BaseEntitySchema = void 0;
// src/schemas/entity.schema.ts
const typebox_1 = require("@sinclair/typebox");
exports.BaseEntitySchema = typebox_1.Type.Object({
    id: typebox_1.Type.String({ format: 'uuid' }),
    kind: typebox_1.Type.Union([
        typebox_1.Type.Literal('Movie'),
        typebox_1.Type.Literal('Person'),
        typebox_1.Type.Literal('Company'),
        typebox_1.Type.Literal('User')
    ])
});
exports.EntitySchema = typebox_1.Type.Intersect([
    exports.BaseEntitySchema,
    typebox_1.Type.Object({
        externalIds: typebox_1.Type.Record(typebox_1.Type.String(), typebox_1.Type.String()),
        status: typebox_1.Type.Optional(typebox_1.Type.Union([typebox_1.Type.Literal('basic'), typebox_1.Type.Literal('medium'), typebox_1.Type.Literal('deep')]))
    })
]);

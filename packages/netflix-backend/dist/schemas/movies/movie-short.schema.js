"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieShortSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
const entity_schema_1 = require("../entity.schema");
// Type.Intersect = extends en TypeBox
exports.MovieShortSchema = typebox_1.Type.Intersect([
    entity_schema_1.EntitySchema,
    typebox_1.Type.Object({
        title: typebox_1.Type.String(),
        // ⚠ index contient juste l'année
        releaseYear: typebox_1.Type.Optional(typebox_1.Type.Integer({
            // <-- changer Type.String => Type.Integer
            description: 'Année de sortie',
            examples: [1999, 2010]
        })),
        categories: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.Integer())),
        tagLine: typebox_1.Type.Optional(typebox_1.Type.String()),
        trailerSource: typebox_1.Type.Optional(typebox_1.Type.String()),
        isLocal: typebox_1.Type.Optional(typebox_1.Type.Boolean())
    })
]);

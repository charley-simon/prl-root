"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieDetailSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
const movie_short_schema_1 = require("../movies/movie-short.schema");
// Type.Intersect = extends en TypeBox
exports.MovieDetailSchema = typebox_1.Type.Intersect([
    movie_short_schema_1.MovieShortSchema,
    typebox_1.Type.Object({
        title: typebox_1.Type.String({ description: 'Titre du film', examples: ['Matrix', 'Inception'] }),
        releaseYear: typebox_1.Type.Integer({
            // <-- changer Type.String => Type.Integer
            description: 'Année de sortie',
            examples: [1999, 2010]
        }),
        originalTitle: typebox_1.Type.Optional(typebox_1.Type.String()),
        budget: typebox_1.Type.Optional(typebox_1.Type.Number()),
        revenue: typebox_1.Type.Optional(typebox_1.Type.Number()),
        categories: typebox_1.Type.Optional(typebox_1.Type.Array(typebox_1.Type.Integer())),
        synopsis: typebox_1.Type.Optional(typebox_1.Type.String()),
        tagLine: typebox_1.Type.Optional(typebox_1.Type.String()),
        popularity: typebox_1.Type.Optional(typebox_1.Type.Number()),
        rating: typebox_1.Type.Optional(typebox_1.Type.Number()),
        video: typebox_1.Type.Optional(typebox_1.Type.Object({
            localPath: typebox_1.Type.Optional(typebox_1.Type.String()),
            provider: typebox_1.Type.Optional(typebox_1.Type.String())
        })),
        wikiDescription: typebox_1.Type.Optional(typebox_1.Type.String())
    })
]);

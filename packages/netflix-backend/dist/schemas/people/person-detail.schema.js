"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonDetailSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
const person_short_schema_1 = require("../../schemas/people/person-short.schema");
// Type.Intersect = extends en TypeBox
exports.PersonDetailSchema = typebox_1.Type.Intersect([
    person_short_schema_1.PersonShortSchema,
    typebox_1.Type.Object({
        name: typebox_1.Type.String({ description: 'Nom complet' }),
        gender: typebox_1.Type.Optional(typebox_1.Type.Integer()),
        biography: typebox_1.Type.Optional(typebox_1.Type.String()),
        birthDay: typebox_1.Type.Optional(typebox_1.Type.String({ format: 'date' })),
        deathDay: typebox_1.Type.Optional(typebox_1.Type.Union([typebox_1.Type.String({ format: 'date' }), typebox_1.Type.Null()])),
        birthPlace: typebox_1.Type.Optional(typebox_1.Type.String()),
        homepage: typebox_1.Type.Optional(typebox_1.Type.Union([typebox_1.Type.String({ format: 'uri' }), typebox_1.Type.Null()])),
        popularity: typebox_1.Type.Optional(typebox_1.Type.Number()),
        wikiDescription: typebox_1.Type.Optional(typebox_1.Type.String())
    })
]);

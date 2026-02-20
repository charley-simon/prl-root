"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalIdsSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.ExternalIdsSchema = typebox_1.Type.Optional(typebox_1.Type.Object({
    tmdb: typebox_1.Type.Optional(typebox_1.Type.Integer()),
    imdb: typebox_1.Type.Optional(typebox_1.Type.String()),
    wikidata: typebox_1.Type.Optional(typebox_1.Type.String())
}));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieListSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
const movie_short_schema_1 = require("./movie-short.schema");
exports.MovieListSchema = typebox_1.Type.Array(movie_short_schema_1.MovieShortSchema);

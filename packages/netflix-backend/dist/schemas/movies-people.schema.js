"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviePeopleListSchema = exports.MoviePeopleSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.MoviePeopleSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Integer(),
    movieId: typebox_1.Type.Integer(),
    peopleId: typebox_1.Type.Integer(),
    jobId: typebox_1.Type.Integer(),
    // metadata de liaison
    options: typebox_1.Type.Optional(typebox_1.Type.String())
});
exports.MoviePeopleListSchema = typebox_1.Type.Array(exports.MoviePeopleSchema);

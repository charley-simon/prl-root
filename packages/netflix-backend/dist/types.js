"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviePeopleSchema = exports.PeopleSchema = exports.MovieSchema = exports.GenderSchema = exports.DepartmentSchema = exports.JobSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
// Reference schemas
exports.JobSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    name: typebox_1.Type.String(),
    type: typebox_1.Type.Literal("J"),
});
exports.DepartmentSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    name: typebox_1.Type.String(),
    type: typebox_1.Type.Literal("D"),
});
exports.GenderSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    name: typebox_1.Type.String(),
    type: typebox_1.Type.Literal("G"),
});
// Core schemas
exports.MovieSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    title: typebox_1.Type.String(),
    releaseYear: typebox_1.Type.Number(),
    isLocal: typebox_1.Type.Boolean(),
    source: typebox_1.Type.String(),
});
exports.PeopleSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    name: typebox_1.Type.String(),
    genderId: typebox_1.Type.Number(),
    birthDate: typebox_1.Type.String(),
});
exports.MoviePeopleSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Number(),
    movieId: typebox_1.Type.Number(),
    peopleId: typebox_1.Type.Number(),
    jobId: typebox_1.Type.Number(),
    departmentId: typebox_1.Type.Number(),
    characterName: typebox_1.Type.Optional(typebox_1.Type.String()),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonListSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
const person_short_schema_1 = require("./person-short.schema");
exports.PersonListSchema = typebox_1.Type.Object({
    items: typebox_1.Type.Array(person_short_schema_1.PersonShortSchema),
    total: typebox_1.Type.Integer(),
    page: typebox_1.Type.Optional(typebox_1.Type.Integer()),
    pageSize: typebox_1.Type.Optional(typebox_1.Type.Integer())
});

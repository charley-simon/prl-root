"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonShortSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
const entity_schema_1 = require("../entity.schema");
exports.PersonShortSchema = typebox_1.Type.Intersect([
    entity_schema_1.EntitySchema,
    typebox_1.Type.Object({
        name: typebox_1.Type.String(),
        gender: typebox_1.Type.Optional(typebox_1.Type.Integer()),
        popularity: typebox_1.Type.Optional(typebox_1.Type.Number())
    })
]);

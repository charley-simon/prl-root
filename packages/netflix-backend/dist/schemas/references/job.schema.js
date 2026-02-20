"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsSchema = exports.JobSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.JobSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Integer({ minimum: 1 }),
    name: typebox_1.Type.String({ minLength: 1 }),
    departmentId: typebox_1.Type.Integer({ minimum: 0 })
});
exports.JobsSchema = typebox_1.Type.Array(exports.JobSchema);

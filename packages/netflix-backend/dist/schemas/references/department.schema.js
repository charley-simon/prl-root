"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentsSchema = exports.DepartmentSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.DepartmentSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Integer({ minimum: 0 }),
    name: typebox_1.Type.String({ minLength: 1 })
});
exports.DepartmentsSchema = typebox_1.Type.Array(exports.DepartmentSchema);

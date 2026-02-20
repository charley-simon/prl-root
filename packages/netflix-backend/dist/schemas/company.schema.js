"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanySchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.CompanySchema = typebox_1.Type.Object({
    id: typebox_1.Type.String(),
    logo_path: typebox_1.Type.String(),
    name: typebox_1.Type.String(),
    origin_country: typebox_1.Type.String()
});

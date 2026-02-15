"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDate = IsDate;
var ajv_1 = require("ajv");
var ajv_formats_1 = require("ajv-formats");
var typebox_1 = require("@sinclair/typebox");
function IsDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
typebox_1.FormatRegistry.Set('date', IsDate);
// ---- AJV + ajv-formats pour formats stricts ----
var ajv = new ajv_1.default({ allErrors: true, strict: false });
(0, ajv_formats_1.default)(ajv);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDate = IsDate;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const typebox_1 = require("@sinclair/typebox");
function IsDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
typebox_1.FormatRegistry.Set('date', IsDate);
// ---- AJV + ajv-formats pour formats stricts ----
(0, ajv_formats_1.default)(new ajv_1.default({ allErrors: true, strict: false }));

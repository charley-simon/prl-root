"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDate = IsDate;
exports.createValidator = createValidator;
exports.validateMovieDetail = validateMovieDetail;
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const compiler_1 = require("@sinclair/typebox/compiler");
const movie_detail_schema_1 = require("../schemas/movies/movie-detail.schema");
const typebox_1 = require("@sinclair/typebox");
function IsDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
typebox_1.FormatRegistry.Set('date', IsDate);
// ---------------------------------------------
// 1️⃣ Validation rapide avec TypeCompiler
const fastValidator = compiler_1.TypeCompiler.Compile(movie_detail_schema_1.MovieDetailSchema);
// ---------------------------------------------
// 2️⃣ Validation stricte avec AJV
const ajv = new ajv_1.default({ allErrors: true, strict: false });
(0, ajv_formats_1.default)(ajv);
const strictValidator = ajv.compile(movie_detail_schema_1.MovieDetailSchema);
function createValidator(schema) {
    const fast = compiler_1.TypeCompiler.Compile(schema);
    const strict = ajv.compile(schema);
    return {
        fast: (data) => fast.Check(data),
        strict: (data) => strict(data)
    };
}
function validateMovieDetail(data, strictFormats = false) {
    if (strictFormats) {
        const isValid = strictValidator(data);
        if (!isValid) {
            console.error('Validation (strict) failed:', strictValidator.errors);
        }
        return isValid;
    }
    else {
        const isValid = fastValidator.Check(data);
        // NOTE : TypeCompiler ne gère pas les formats,
        // il ne regarde que types + structure
        if (!isValid) {
            console.error('Validation (fast) failed:', [...fastValidator.Errors(data)]);
        }
        return isValid;
    }
}
/* Utilisation:
const movieDetailValidator = createValidator(MovieDetailSchema)

movieDetailValidator.fast(data)    // rapide
movieDetailValidator.strict(data)  // strict + formats
*/

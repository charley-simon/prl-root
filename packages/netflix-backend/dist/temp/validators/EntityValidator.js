"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeboxEntityValidator = exports.ValidationError = void 0;
// src/validators/EntityValidator.ts
const compiler_1 = require("@sinclair/typebox/compiler");
const movie_detail_schema_1 = require("../../schemas/movies/movie-detail.schema");
const person_detail_schema_1 = require("../../schemas/people/person-detail.schema");
const company_schema_1 = require("../../schemas/company.schema");
// Erreur dédiée, même pattern que ProviderError
class ValidationError extends Error {
    constructor(kind, errors) {
        super(`[ValidationError] Invalid ${kind}: ${JSON.stringify(errors)}`);
        this.kind = kind;
        this.errors = errors;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class TypeboxEntityValidator {
    constructor() {
        this.validators = new Map([
            ['Movie', compiler_1.TypeCompiler.Compile(movie_detail_schema_1.MovieDetailSchema)],
            ['Person', compiler_1.TypeCompiler.Compile(person_detail_schema_1.PersonDetailSchema)],
            ['Company', compiler_1.TypeCompiler.Compile(company_schema_1.CompanySchema)]
        ]);
    }
    validate(entity) {
        const validator = this.validators.get(entity.kind);
        if (!validator) {
            throw new ValidationError(entity.kind, [`Unknown kind: ${entity.kind}`]);
        }
        if (!validator.Check(entity)) {
            const errors = [...validator.Errors(entity)];
            throw new ValidationError(entity.kind, errors); // ← fix ici
        }
    }
}
exports.TypeboxEntityValidator = TypeboxEntityValidator;

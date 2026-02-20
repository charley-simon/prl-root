"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsDate = IsDate;
exports.validatePersonDetail = validatePersonDetail;
const compiler_1 = require("@sinclair/typebox/compiler");
const person_detail_schema_1 = require("../schemas/people/person-detail.schema");
const ajv_1 = __importDefault(require("ajv"));
const ajv_formats_1 = __importDefault(require("ajv-formats"));
const typebox_1 = require("@sinclair/typebox");
function IsDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
typebox_1.FormatRegistry.Set('date', IsDate);
// ---------------------------------------------
// 1️⃣ Validation rapide avec TypeCompiler
const validatorFast = compiler_1.TypeCompiler.Compile(person_detail_schema_1.PersonDetailSchema);
// ---------------------------------------------
// 2️⃣ Validation stricte avec AJV
const ajv = new ajv_1.default({ allErrors: true, strict: false });
(0, ajv_formats_1.default)(ajv);
// ---- TypeCompiler pour structure/types ----
const fastValidator = compiler_1.TypeCompiler.Compile(person_detail_schema_1.PersonDetailSchema);
const strictValidator = ajv.compile(person_detail_schema_1.PersonDetailSchema);
function validatePersonDetail(data, strictFormats = false) {
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
const jsonData = {
    id: 108,
    name: 'Peter Jackson',
    biography: "Peter Jackson est un réalisateur, scénariste et producteur néo-zélandais, né le 31 octobre 1961 à Wellington. Il est surtout connu pour avoir réalisé la trilogie du Seigneur des anneaux, d'après l'œuvre de J. R. R. Tolkien, et un remake de King Kong. Il réalise ensuite Le Hobbit, l'adaptation cinématographique en trois volets du roman de Tolkien.\n\nIl est membre de l'Ordre de Nouvelle-Zélande, chevalier de l'Ordre du Mérite de Nouvelle-Zélande et Officier des Arts et des Lettres.\n\nSource : https://fr.wikipedia.org (licensed under CC-BY-SA)",
    deathDay: null,
    birthDay: '1961-10-31',
    birthPlace: 'Pukerua Bay, North Island, New Zealand',
    gender: 2,
    homepage: null,
    popularity: 2.4438,
    externalIds: {
        tmdb: '108',
        imdb: 'nm0001392',
        wikidata: 'Q4465'
    }
};
console.log('Validation rapide: ', validatePersonDetail(jsonData, false)); // Retourne false !
console.log('Validation stricte: ', validatePersonDetail(jsonData, true)); // retourne true !

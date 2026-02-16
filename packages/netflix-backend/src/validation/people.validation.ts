import { TypeCompiler } from '@sinclair/typebox/compiler'
import { PersonDetailSchema } from '../schemas/people/person-detail.schema'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { FormatRegistry } from '@sinclair/typebox'

export function IsDate(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}
FormatRegistry.Set('date', IsDate)

// ---------------------------------------------
// 1️⃣ Validation rapide avec TypeCompiler
const validatorFast = TypeCompiler.Compile(PersonDetailSchema)

// ---------------------------------------------
// 2️⃣ Validation stricte avec AJV
const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

// ---- TypeCompiler pour structure/types ----
const fastValidator = TypeCompiler.Compile(PersonDetailSchema)
const strictValidator = ajv.compile(PersonDetailSchema)

export function validatePersonDetail(data: unknown, strictFormats = false): boolean {
  if (strictFormats) {
    const isValid = strictValidator(data)
    if (!isValid) {
      console.error('Validation (strict) failed:', strictValidator.errors)
    }
    return isValid
  } else {
    const isValid = fastValidator.Check(data)

    // NOTE : TypeCompiler ne gère pas les formats,
    // il ne regarde que types + structure

    if (!isValid) {
      console.error('Validation (fast) failed:', [...fastValidator.Errors(data)])
    }
    return isValid
  }
}

const jsonData = {
  id: 108,
  name: 'Peter Jackson',
  biography:
    "Peter Jackson est un réalisateur, scénariste et producteur néo-zélandais, né le 31 octobre 1961 à Wellington. Il est surtout connu pour avoir réalisé la trilogie du Seigneur des anneaux, d'après l'œuvre de J. R. R. Tolkien, et un remake de King Kong. Il réalise ensuite Le Hobbit, l'adaptation cinématographique en trois volets du roman de Tolkien.\n\nIl est membre de l'Ordre de Nouvelle-Zélande, chevalier de l'Ordre du Mérite de Nouvelle-Zélande et Officier des Arts et des Lettres.\n\nSource : https://fr.wikipedia.org (licensed under CC-BY-SA)",
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
}

console.log('Validation rapide: ', validatePersonDetail(jsonData, false)) // Retourne false !
console.log('Validation stricte: ', validatePersonDetail(jsonData, true)) // retourne true !

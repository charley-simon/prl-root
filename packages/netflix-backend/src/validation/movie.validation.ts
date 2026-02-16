import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { TSchema } from '@sinclair/typebox'
import { MovieDetailSchema } from '../schemas/movies/movie-detail.schema'
import { FormatRegistry } from '@sinclair/typebox'

export function IsDate(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}
FormatRegistry.Set('date', IsDate)

// ---------------------------------------------
// 1️⃣ Validation rapide avec TypeCompiler
const fastValidator = TypeCompiler.Compile(MovieDetailSchema)

// ---------------------------------------------
// 2️⃣ Validation stricte avec AJV
const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const strictValidator = ajv.compile(MovieDetailSchema)

export function createValidator(schema: TSchema) {
  const fast = TypeCompiler.Compile(schema)
  const strict = ajv.compile(schema)

  return {
    fast: (data: unknown) => fast.Check(data),
    strict: (data: unknown) => strict(data)
  }
}

export function validateMovieDetail(data: unknown, strictFormats = false): boolean {
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

/* Utilisation:
const movieDetailValidator = createValidator(MovieDetailSchema)

movieDetailValidator.fast(data)    // rapide
movieDetailValidator.strict(data)  // strict + formats
*/
